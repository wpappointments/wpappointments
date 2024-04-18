import { selectors as appointments } from './appointments/appointments';
import { selectors as availability } from './availability/availability';
import { selectors as customers } from './customers/customers';
import { selectors as notices } from './notices/notices';
import { selectors as settings } from './settings/settings';
import { selectors as appointmentSlideoutSelectors } from './slideout/appointment/appointment';
import { selectors as slideouts } from './slideout/slideout';

export default {
	...settings,
	...appointments,
	...slideouts,
	...notices,
	...availability,
	...appointmentSlideoutSelectors,
	...customers,
};
