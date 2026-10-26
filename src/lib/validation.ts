const META_ID = /^[0-9]{5,30}$/;
export const isMetaId = (v: unknown): v is string => typeof v === 'string' && META_ID.test(v);
export const requireMetaId = (v: unknown): string => {
  if (!isMetaId(v)) throw new Error('ID de Meta inválido (solo dígitos).');
  return v;
};
export const safeError = (e: unknown): string => {
  let text = e instanceof Error ? e.message : 'Error desconocido';
  text = text.replace(/(EAA[a-zA-Z0-9_\-.]+)/g, '[SECRETO]')
    .replace(/(access_token|token|authorization)\s*[=:]\s*[^\s,;&"']+/gi, '$1=[OCULTO]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [OCULTO]')
    .replace(/https?:\/\/\S+/g, '[URL]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[EMAIL]')
    .replace(/(?:\+?\d[\s().-]*){9,}/g,'[TELEFONO]');
  return text.slice(0, 240);
};
export const getObject = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
export const getString = (value: unknown, max = 400): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
