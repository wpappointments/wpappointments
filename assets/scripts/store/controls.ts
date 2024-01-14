import apiFetch from '~/utils/fetch';
import { FetchFromApiActionReturn } from './actions';
import { controls as appointments } from './appointments/appointments';
import { controls as settings } from './settings/settings';
import { controls as slideouts } from './slideout/slideout';

function isAction(action: unknown): action is FetchFromApiActionReturn {
	return (
		action !== null &&
		typeof action === 'object' &&
		'path' in action &&
		typeof action.path === 'string'
	);
}

const baseControls = {
	FETCH_FROM_API(action: unknown) {
		if (isAction(action)) {
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
};
