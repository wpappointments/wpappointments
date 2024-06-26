import { APIFetchOptions } from '@wordpress/api-fetch';
import { actions as appointments } from './appointments/appointments';
import { actions as availability } from './availability/availability';
import { actions as customers } from './customers/customers';
import { actions as notices } from './notices/notices';
import { actions as settings } from './settings/settings';
import { actions as appointmentSlideoutActions } from './slideout/appointment/appointment';
import { actions as slideouts } from './slideout/slideout';

export type BaseActions = typeof baseActions;
export type FetchFromApiAction = BaseActions['fetchFromAPI'];
export type FetchFromApiActionReturn = ReturnType<FetchFromApiAction>;

export const baseActions = {
	fetchFromAPI(path: string, data?: APIFetchOptions['data']) {
		return {
			type: 'FETCH_FROM_API',
			path,
			data,
		} as const;
	},
};

export default {
	...baseActions,
	...settings,
	...appointments,
	...slideouts,
	...notices,
	...availability,
	...appointmentSlideoutActions,
	...customers,
};
