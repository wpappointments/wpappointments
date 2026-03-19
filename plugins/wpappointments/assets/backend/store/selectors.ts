import { selectors as appointments } from './appointments/appointments';
import { selectors as availability } from './availability/availability';
import { selectors as bookables } from './bookables/bookables';
import { selectors as customers } from './customers/customers';
import { selectors as entities } from './entities/entities';
import { selectors as notices } from './notices/notices';
import { selectors as services } from './services/services';
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
	...entities,
	...services,
	...bookables,
};
