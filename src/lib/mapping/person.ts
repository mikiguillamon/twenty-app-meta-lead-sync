import type { MappingRule, MetaLead, PersonField } from '../types.ts';
import { getObject, getString } from '../validation.ts';

const DEFAULT_FIELDS: PersonField[] = [
  { name: 'name.fullName', label: 'Nombre completo (separar)', type: 'FULL_NAME' },
  { name: 'name.firstName', label: 'Nombre', type: 'TEXT' },
  { name: 'name.lastName', label: 'Apellidos', type: 'TEXT' },
  { name: 'emails.primaryEmail', label: 'Email principal', type: 'EMAILS' },
  { name: 'phones.primaryPhoneNumber', label: 'Teléfono principal', type: 'PHONES' },
];
const SUPPORTED_TYPES = new Set(['TEXT', 'RICH_TEXT', 'NUMBER', 'NUMERIC', 'BOOLEAN', 'DATE', 'DATE_TIME', 'SELECT', 'MULTI_SELECT']);
const RESERVED_NAMES = new Set(['name', 'emails', 'phones', 'id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy', 'updatedBy', 'position']);
const FIELD_NAME = /^[a-zA-Z][a-zA-Z0-9_]{0,80}$/;
export const builtinFields = () => DEFAULT_FIELDS.map(x => ({ ...x }));

const toList = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  const o = getObject(v);
  if (Array.isArray(o.edges)) return o.edges.map(e => getObject(e).node);
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.fields)) return o.fields;
  return [];
};

/** Normalize version-dependent Twenty REST metadata envelopes, fail closed for unknown fields. */
export function normalizePersonFields(objectsResponse: unknown, fieldsResponse?: unknown): PersonField[] {
  const root = getObject(objectsResponse);
  const data = getObject(root.data);
  const candidates = [...toList(root.objects), ...toList(data.objects), ...toList(root.data), ...toList(root)];
  const person = candidates.map(getObject).find(o => o.nameSingular === 'person' || o.namePlural === 'people');
  const personId = typeof person?.id === 'string' ? person.id : '';
  const second = getObject(fieldsResponse);
  const secondData = getObject(second.data);
  const rawFields = [
    ...(person ? toList(person.fields) : []),
    ...[...toList(second.fields), ...toList(secondData.fields), ...toList(second.data)]
      .filter(x => !!personId && getString(getObject(x).objectMetadataId,120) === personId),
  ];
  const fields = new Map<string, PersonField>(DEFAULT_FIELDS.map(f => [f.name, f]));
  for (const x of rawFields) {
    const f = getObject(x);
    const parentId = getString(f.objectMetadataId, 120);
    if (parentId && personId && parentId !== personId) continue;
    if (!person && !personId && !parentId) continue; // do not mix unrelated objects
    const name = getString(f.name, 100);
    const type = getString(f.type, 40).toUpperCase();
    if (!FIELD_NAME.test(name) || RESERVED_NAMES.has(name) || !SUPPORTED_TYPES.has(type)) continue;
    if (f.isActive === false || f.isUIReadOnly === true || f.isSystem === true) continue;
    const options = toList(f.options).map(o => {
      const p = getObject(o);
      return { label: getString(p.label, 160), value: getString(p.value, 160) };
    }).filter(o => o.value);
    fields.set(name, { name, label: getString(f.label, 160) || name, type, isCustom: f.isCustom === true, ...(options.length ? { options } : {}) });
  }
  return [...fields.values()];
}

export function validateMappings(mappings: MappingRule[], questions: { key: string }[], fields: PersonField[]): MappingRule[] {
  if (!Array.isArray(mappings)) throw new Error('Mapeo inválido');
  const allowedQuestions = new Set(questions.map(q => q.key));
  const allowedFields = new Set(fields.map(f => f.name));
  const seen = new Set<string>();
  const targets = new Set<string>();
  if (mappings.length > 150) throw new Error('Demasiadas reglas de mapeo');
  return mappings.map(rule => {
    const { questionKey, target } = rule ?? {};
    if (typeof questionKey !== 'string' || !allowedQuestions.has(questionKey)) throw new Error(`Pregunta desconocida: ${questionKey}`);
    if (typeof target !== 'string' || !allowedFields.has(target)) throw new Error(`Campo Twenty no permitido: ${target}`);
    if (seen.has(questionKey) || targets.has(target)) throw new Error('Mapeo duplicado');
    seen.add(questionKey); targets.add(target);
    const replacements = getObject(rule.replacements);
    if (Object.keys(replacements).length > 100) throw new Error('Demasiadas sustituciones');
    const safeReplacements: Record<string,string> = {};
    for (const [original, replacement] of Object.entries(replacements)) {
      if (original.length > 150 || typeof replacement !== 'string' || replacement.length > 150) throw new Error('Sustitución de opción inválida');
      safeReplacements[original] = replacement;
    }
    return { questionKey, target, ...(Object.keys(safeReplacements).length ? { replacements: safeReplacements } : {}) };
  });
}

export type PersonDraft = Record<string, unknown> & {
  name?: { firstName?: string; lastName?: string };
  emails?: { primaryEmail?: string };
  phones?: { primaryPhoneNumber?: string };
};
export type MappingResult = { draft: PersonDraft; email?: string; phone?: string; issues: string[] };
const emailOk = (v: string) => /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(v) && v.length <= 320;
const normalizePhone = (v: string): string => v.trim().replace(/[\s()\-]/g, '').slice(0, 50);
export function splitFullName(input: string): { firstName: string; lastName: string } {
  const text = input.trim().replace(/\s+/g, ' ');
  if (text.includes(',')) { const [surname, ...first] = text.split(','); return { firstName: first.join(',').trim(), lastName: surname.trim() }; }
  const words = text.split(' ');
  return { firstName: words.shift() ?? '', lastName: words.join(' ') };
}
const caseFold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase('en');
function convertScalar(input: string, field: PersonField, replacements: Record<string,string>, issues: string[]): unknown {
  const raw = input.trim().slice(0, 2000);
  if (!raw) return undefined;
  const replaced = Object.entries(replacements).find(([k]) => caseFold(k) === caseFold(raw))?.[1] ?? raw;
  switch (field.type) {
    case 'TEXT': case 'RICH_TEXT': return replaced;
    case 'NUMBER': case 'NUMERIC': {
      const normalized = replaced.replace(',', '.');
      const n = Number(normalized);
      if (!Number.isFinite(n) || normalized.length > 40) { issues.push(`Número inválido: ${field.label}`); return undefined; }
      return field.type === 'NUMERIC' ? normalized : n;
    }
    case 'BOOLEAN': {
      if (['true','yes','si','sí','1','on'].includes(caseFold(replaced))) return true;
      if (['false','no','0','off'].includes(caseFold(replaced))) return false;
      issues.push(`Valor booleano inválido: ${field.label}`); return undefined;
    }
    case 'DATE': case 'DATE_TIME': {
      const time = Date.parse(replaced);
      if (Number.isNaN(time)) { issues.push(`Fecha inválida: ${field.label}`); return undefined; }
      return field.type === 'DATE' ? new Date(time).toISOString().slice(0,10) : new Date(time).toISOString();
    }
    case 'SELECT': case 'MULTI_SELECT': {
      const option = field.options?.find(o => caseFold(o.value) === caseFold(replaced) || caseFold(o.label) === caseFold(replaced));
      if (!option) { issues.push(`Opción no configurada: ${field.label}`); return undefined; }
      return option.value;
    }
    default: issues.push(`Tipo no soportado: ${field.label}`); return undefined;
  }
}

export function mapLeadToPerson(lead: MetaLead, mappings: MappingRule[], available: PersonField[]): MappingResult {
  const issues: string[] = [];
  const byQuestion = new Map((lead.field_data ?? []).filter(x => x && typeof x.name === 'string').map(f => [f.name, Array.isArray(f.values) ? f.values : []]));
  const fields = new Map(available.map(f => [f.name, f]));
  const draft: PersonDraft = {};
  for (const rule of mappings) {
    const values = byQuestion.get(rule.questionKey);
    if (!values?.length) continue;
    const field = fields.get(rule.target);
    if (!field) { issues.push('Destino ya no existe'); continue; }
    const text = values.map(v => getString(v, 2000)).filter(Boolean);
    if (!text.length) continue;
    const replacement = rule.replacements ?? {};
    if (rule.target === 'name.fullName') {
      draft.name = { ...draft.name, ...splitFullName(text[0]) };
    } else if (rule.target === 'name.firstName') {
      draft.name = { ...draft.name, firstName: text[0] };
    } else if (rule.target === 'name.lastName') {
      draft.name = { ...draft.name, lastName: text[0] };
    } else if (rule.target === 'emails.primaryEmail') {
      if (!emailOk(text[0])) issues.push('Email inválido');
      else draft.emails = { primaryEmail: text[0].toLowerCase() };
    } else if (rule.target === 'phones.primaryPhoneNumber') {
      const phone = normalizePhone(text[0]);
      if (phone.replace(/\D/g,'').length < 6) issues.push('Teléfono inválido');
      else draft.phones = { primaryPhoneNumber: phone };
    } else if (field.type === 'MULTI_SELECT') {
      const out = text.map(v => convertScalar(v, field, replacement, issues)).filter(x => x !== undefined);
      if (out.length) draft[field.name] = [...new Set(out)];
    } else {
      const out = convertScalar(text[0], field, replacement, issues);
      if (out !== undefined) draft[field.name] = out;
    }
  }
  const email = draft.emails?.primaryEmail;
  const phone = draft.phones?.primaryPhoneNumber;
  if (!email && !phone) issues.push('No hay email ni teléfono válido para identificar la Persona');
  return { draft, email, phone, issues };
}
