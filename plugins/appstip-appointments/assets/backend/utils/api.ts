import { __ } from '@wordpress/i18n';
import { displayErrorToast } from '@wpappointments/data';

export function missingId(id: number, errorPrefix: string, message?: string) {
	if (!id) {
		displayErrorToast(
			`${errorPrefix}: ${
				message || __('Item ID is missing', 'appstip-appointments')
			}`
		);

		return true;
	}

	return false;
}
