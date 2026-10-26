import { defineApplicationRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, SystemPermissionFlag } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';

export default defineApplicationRole({
  universalIdentifier: IDS.ROLE,
  label: 'Meta Lead Sync application',
  description: 'Acceso limitado a Personas, su ledger y lectura de metadatos.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true, canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: IDS.LEDGER_OBJECT,
      canReadObjectRecords: true, canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false, canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS, SystemPermissionFlag.DATA_MODEL],
});
