import apiFetch from '~/utils/fetch';
import { controls as settings } from './settings/settings';
import { controls as appointments } from './appointments/appointments';
import { FetchFromApiActionReturn } from './actions';

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
