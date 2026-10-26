import { defineObject, FieldType, MetadataWritability, MetadataReadability } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';

export default defineObject({
  universalIdentifier: IDS.LEDGER_OBJECT,
  nameSingular: 'metaSyncSubmission',
  namePlural: 'metaSyncSubmissions',
  labelSingular: 'Meta Sync Submission',
  labelPlural: 'Meta Sync Submissions',
  icon: 'IconBrandMeta',
  description: 'Ledger interno de deduplicación y auditoría de entregas Meta.',
  writability: MetadataWritability.APPLICATION,
  readability: MetadataReadability.APPLICATION,
  fields: [
    { universalIdentifier: IDS.LEDGER_ID_FIELD, name: 'leadgenId', label: 'Leadgen ID', type: FieldType.TEXT, icon: 'IconHash' },
    { universalIdentifier: IDS.LEDGER_PAGE_FIELD, name: 'metaPageId', label: 'Page ID', type: FieldType.TEXT, icon: 'IconPageBreak' },
    { universalIdentifier: IDS.LEDGER_FORM_FIELD, name: 'metaFormId', label: 'Form ID', type: FieldType.TEXT, icon: 'IconForms' },
    { universalIdentifier: IDS.LEDGER_STATUS_FIELD, name: 'status', label: 'Estado', type: FieldType.SELECT, icon: 'IconStatusChange', options: [
      { value: 'CLAIMED', label: 'En proceso', color: 'blue', position: 0 },
      { value: 'PROCESSED', label: 'Procesado', color: 'green', position: 1 },
      { value: 'NEEDS_REVIEW', label: 'Revisar', color: 'orange', position: 2 },
      { value: 'FAILED', label: 'Fallido', color: 'red', position: 3 },
    ], defaultValue: "'CLAIMED'" },
    { universalIdentifier: IDS.LEDGER_PERSON_FIELD, name: 'personRecordId', label: 'Persona Twenty ID', type: FieldType.TEXT, icon: 'IconUser' },
    { universalIdentifier: IDS.LEDGER_META_CREATED_FIELD, name: 'metaCreatedAt', label: 'Fecha Meta', type: FieldType.DATE_TIME, icon: 'IconCalendar' },
    { universalIdentifier: IDS.LEDGER_ERROR_FIELD, name: 'failureReason', label: 'Error sin datos sensibles', type: FieldType.TEXT, icon: 'IconAlertTriangle' },
    { universalIdentifier: IDS.LEDGER_ANSWERS_FIELD, name: 'answers', label: 'Respuestas del formulario', type: FieldType.RAW_JSON, icon: 'IconFileText' },
  ],
});
