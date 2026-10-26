import { defineFrontComponent } from 'twenty-sdk/define';
import { IDS } from '../constants/ids.ts';
import { AdminPanel } from './admin-panel.tsx';
export default defineFrontComponent({ universalIdentifier: IDS.FRONT_CONNECTIONS, name: 'meta-sync-connections', description: 'Credenciales Meta por workspace',
  component: () => <AdminPanel screen="connections" /> });
