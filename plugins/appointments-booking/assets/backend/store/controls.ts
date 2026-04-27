import { any, is, literal, object, string } from 'valibot';
import apiFetch from '~/backend/utils/fetch';
import { controls as appointments } from './appointments/appointments';
import { controls as availability } from './availability/availability';
import { controls as customers } from './customers/customers';
import { controls as notices } from './notices/notices';
import { controls as settings } from './settings/settings';
import { controls as slideouts } from './slideout/slideout';

const FetchFromApiActionSchema = object({
	type: literal('FETCH_FROM_API'),
	path: string(),
	data: any(),
});

const baseControls = {
	FETCH_FROM_API(action: unknown) {
		if (is(FetchFromApiActionSchema, action)) {
			return apiFetch({ path: action.path, data: action?.data });
		}

		return null;
	},
};

export default {
	...baseControls,
	...settings,
	...appointments,
	...slideouts,
	...notices,
	...availability,
	...customers,
};
