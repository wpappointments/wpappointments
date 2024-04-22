import { resolvers as appointments } from './appointments/appointments';
import { resolvers as availability } from './availability/availability';
import { resolvers as customers } from './customers/customers';
import { resolvers as notices } from './notices/notices';
import { resolvers as settings } from './settings/settings';
import { resolvers as slideouts } from './slideout/slideout';

export default {
	...settings,
	...appointments,
	...slideouts,
	...notices,
	...availability,
	...customers,
};
