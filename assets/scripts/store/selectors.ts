import { selectors as appointments } from './appointments/appointments';
import { selectors as settings } from './settings/settings';
import { selectors as slideouts } from './slideout/slideout';

export default {
	...settings,
	...appointments,
	...slideouts,
};
