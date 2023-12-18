import { resolvers as settings } from './settings/settings';
import { resolvers as appointments } from './appointments/appointments';

export default {
	...settings,
	...appointments,
};
