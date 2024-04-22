import { __ } from '@wordpress/i18n';

export function getSubmitButtonLabel(mode: 'view' | 'edit' | 'create') {
	switch (mode) {
		case 'edit':
			return __('Update Appointment', 'wpappointments');
		case 'create':
			return __('Create Appointment', 'wpappointments');
		default:
			return __('Edit Appointment', 'wpappointments');
	}
}
