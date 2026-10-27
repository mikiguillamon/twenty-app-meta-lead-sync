import { defineSettingsMenuItem } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
export default defineSettingsMenuItem({ universalIdentifier: IDS.MENU_PAGES, frontComponentUniversalIdentifier: IDS.FRONT_PAGES,
  title: 'Pages', icon: 'IconBrandFacebook', position: 2 });
