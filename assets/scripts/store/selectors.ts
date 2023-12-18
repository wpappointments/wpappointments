import { selectors as settings } from './settings/settings';
import { selectors as appointments } from './appointments/appointments';

export default {
	...settings,
	...appointments,
};
