import { defineIndex } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineIndex({
  universalIdentifier: IDS.LEDGER_INDEX,
  objectUniversalIdentifier: IDS.LEDGER_OBJECT,
  isUnique: true,
  fields: [{ universalIdentifier: IDS.LEDGER_INDEX_FIELD, fieldUniversalIdentifier: IDS.LEDGER_ID_FIELD }],
});
