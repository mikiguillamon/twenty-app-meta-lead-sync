import { defineFrontComponent } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { AdminPanel } from './admin-panel.tsx';
export default defineFrontComponent({ universalIdentifier: IDS.FRONT_FORMS, name: 'meta-sync-forms', description: 'Formularios Meta',
  component: () => <AdminPanel screen="forms" /> });
