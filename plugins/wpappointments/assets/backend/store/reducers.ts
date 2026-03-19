import { reducer as appointments } from './appointments/appointments';
import { reducer as availability } from './availability/availability';
import { reducer as bookables } from './bookables/bookables';
import { reducer as customers } from './customers/customers';
import { reducer as entities } from './entities/entities';
import { reducer as notices } from './notices/notices';
import { reducer as services } from './services/services';
import { reducer as settings } from './settings/settings';
import { reducer as appointmentSlideout } from './slideout/appointment/appointment';
import { reducer as slideouts } from './slideout/slideout';

export default {
	settings,
	appointments,
	slideouts,
	notices,
	availability,
	appointmentSlideout,
	customers,
	entities,
	services,
	bookables,
};
