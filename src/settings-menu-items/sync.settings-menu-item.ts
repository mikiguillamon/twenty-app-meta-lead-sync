import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_SYNC, frontComponentUniversalIdentifier: IDS.FRONT_SYNC,
  title: 'Sincronización', icon: 'IconRefresh', position: 5 });
