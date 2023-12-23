import apiFetch from '~/utils/fetch';
import { FetchFromApiActionReturn } from './actions';
import { controls as appointments } from './appointments/appointments';
import { controls as settings } from './settings/settings';

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
			return apiFetch({ path: action.path });
		}

		return null;
	},
};

export default {
	...baseControls,
	...settings,
	...appointments,
};
