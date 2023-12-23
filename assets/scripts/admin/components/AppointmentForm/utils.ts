import { __ } from '@wordpress/i18n';

export function getSubmitButtonLabel(mode: 'view' | 'edit' | 'create') {
	switch (mode) {
		case 'edit':
			return __('Update Appointment');
		case 'create':
			return __('Create Appointment');
		default:
			return __('Edit Appointment');
	}
}
