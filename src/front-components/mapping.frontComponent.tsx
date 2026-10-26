import { defineFrontComponent } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { AdminPanel } from './admin-panel.tsx';
export default defineFrontComponent({ universalIdentifier: IDS.FRONT_MAPPING, name: 'meta-sync-mapping', description: 'Mapeos por formulario',
  component: () => <AdminPanel screen="mapping" /> });
