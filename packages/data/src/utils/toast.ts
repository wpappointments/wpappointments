import { dispatch } from '@wordpress/data';
import randomId from './randomId';

const STORE_NAME = 'appointments-booking';

function displayToast(message: string, type: 'success' | 'error') {
	const toastId = randomId();

	// @ts-expect-error -- string-based store access loses type inference
	dispatch(STORE_NAME).openToast({
		id: toastId,
		type,
		message,
	});

	setTimeout(() => {
		// @ts-expect-error -- string-based store access loses type inference
		dispatch(STORE_NAME).closeToast(toastId);
	}, 2000);
}

export function displaySuccessToast(message: string) {
	displayToast(message, 'success');
}

export function displayErrorToast(message: string) {
	displayToast(message, 'error');
}
