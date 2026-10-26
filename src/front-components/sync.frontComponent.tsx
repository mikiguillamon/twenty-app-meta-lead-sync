import { defineFrontComponent } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { AdminPanel } from './admin-panel.tsx';
export default defineFrontComponent({ universalIdentifier: IDS.FRONT_SYNC, name: 'meta-sync-history', description: 'Sincronización e historial',
  component: () => <AdminPanel screen="sync" /> });
