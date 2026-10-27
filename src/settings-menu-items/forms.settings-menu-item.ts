import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_FORMS, frontComponentUniversalIdentifier: IDS.FRONT_FORMS,
  title: 'Forms', icon: 'IconForms', position: 3 });
