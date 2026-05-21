import { __ } from '@wordpress/i18n';

export function getSubmitButtonLabel(mode?: 'view' | 'edit' | 'create') {
	switch (mode) {
		case 'edit':
			return __('Update Appointment', 'appstip-appointments');
		case 'create':
			return __('Create Appointment', 'appstip-appointments');
		default:
			return __('Edit Appointment', 'appstip-appointments');
	}
}
