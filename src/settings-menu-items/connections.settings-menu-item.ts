import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_CONNECTIONS, frontComponentUniversalIdentifier: IDS.FRONT_CONNECTIONS,
  title: 'Conexiones', icon: 'IconKey', position: 1 });
