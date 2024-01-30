import { resolvers as appointments } from './appointments/appointments';
import { resolvers as notices } from './notices/notices';
import { resolvers as settings } from './settings/settings';
import { resolvers as slideouts } from './slideout/slideout';

export default {
	...settings,
	...appointments,
	...slideouts,
	...notices,
};
