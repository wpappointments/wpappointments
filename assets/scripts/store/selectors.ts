import { selectors as appointments } from './appointments/appointments';
import { selectors as settings } from './settings/settings';

export default {
	...settings,
	...appointments,
};
