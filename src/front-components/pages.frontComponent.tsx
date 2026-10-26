import { defineFrontComponent } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { AdminPanel } from './admin-panel.tsx';
export default defineFrontComponent({ universalIdentifier: IDS.FRONT_PAGES, name: 'meta-sync-pages', description: 'Páginas Meta',
  component: () => <AdminPanel screen="pages" /> });
