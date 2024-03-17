import { __ } from '@wordpress/i18n';
import { displayErrorToast } from '~/backend/utils/toast';

export function missingId(id: number, errorPrefix: string, message?: string) {
	if (!id) {
		displayErrorToast(
			`${errorPrefix}: ${
				message || __('Item ID is missing', 'wpappointments')
			}`
		);

		return true;
	}

	return false;
}
