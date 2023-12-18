import { actions as settings } from './settings/settings';
import { actions as appointments } from './appointments/appointments';

export type BaseActions = typeof baseActions;
export type FetchFromApiAction = BaseActions['fetchFromAPI'];
export type FetchFromApiActionReturn = ReturnType<FetchFromApiAction>;

export const baseActions = {
	fetchFromAPI(path: string) {
		return {
			type: 'FETCH_FROM_API',
			path,
		} as const;
	},
};

export default {
	...baseActions,
	...settings,
	...appointments,
};
