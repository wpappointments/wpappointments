import { __ } from '@wordpress/i18n';
import { displayErrorToast } from '@wpappointments/data';

export function missingId(id: number, errorPrefix: string, message?: string) {
	if (!id) {
		displayErrorToast(
			`${errorPrefix}: ${
				message || __('Item ID is missing', 'appointments-booking')
			}`
		);

		return true;
	}

	return false;
}
