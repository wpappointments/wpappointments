import { dispatch } from '@wordpress/data';
import { store } from '~/backend/store/store';
import randomId from './random';

export function displaySuccessToast(message: string) {
	const toastId = randomId();

	dispatch(store).openToast({
		id: toastId,
		type: 'success',
		message,
	});

	setTimeout(() => {
		dispatch(store).closeToast(toastId);
	}, 2000);
}

export function displayErrorToast(message: string) {
	const toastId = randomId();

	dispatch(store).openToast({
		id: toastId,
		type: 'error',
		message,
	});

	setTimeout(() => {
		dispatch(store).closeToast(toastId);
	}, 2000);
}
