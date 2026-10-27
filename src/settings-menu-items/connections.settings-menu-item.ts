import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_CONNECTIONS, frontComponentUniversalIdentifier: IDS.FRONT_CONNECTIONS,
  title: 'Connections', icon: 'IconKey', position: 1 });
