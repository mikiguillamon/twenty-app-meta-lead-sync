import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_MAPPING, frontComponentUniversalIdentifier: IDS.FRONT_MAPPING,
  title: 'Mapping', icon: 'IconAdjustments', position: 4 });
