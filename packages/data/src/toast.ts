import { dispatch } from '@wordpress/data';
import randomId from './random';

const STORE_NAME = 'wpappointments';

export function displaySuccessToast(message: string) {
	const toastId = randomId();

	// @ts-expect-error -- string-based store access loses type inference
	dispatch(STORE_NAME).openToast({
		id: toastId,
		type: 'success',
		message,
	});

	setTimeout(() => {
		// @ts-expect-error -- string-based store access loses type inference
		dispatch(STORE_NAME).closeToast(toastId);
	}, 2000);
}

export function displayErrorToast(message: string) {
	const toastId = randomId();

	// @ts-expect-error -- string-based store access loses type inference
	dispatch(STORE_NAME).openToast({
		id: toastId,
		type: 'error',
		message,
	});

	setTimeout(() => {
		// @ts-expect-error -- string-based store access loses type inference
		dispatch(STORE_NAME).closeToast(toastId);
	}, 2000);
}
