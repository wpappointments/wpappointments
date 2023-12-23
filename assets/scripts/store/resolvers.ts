import { resolvers as appointments } from './appointments/appointments';
import { resolvers as settings } from './settings/settings';

export default {
	...settings,
	...appointments,
};
