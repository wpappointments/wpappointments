import { __ } from '@wordpress/i18n';

export function getSubmitButtonLabel(mode?: 'view' | 'edit' | 'create') {
	switch (mode) {
		case 'edit':
			return __('Update Appointment', 'appointments-booking');
		case 'create':
			return __('Create Appointment', 'appointments-booking');
		default:
			return __('Edit Appointment', 'appointments-booking');
	}
}
