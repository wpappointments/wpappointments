import { __ } from '@wordpress/i18n';

export function getAppointmentSlideOutTitle(mode: 'view' | 'edit' | 'create') {
	switch (mode) {
		case 'create':
			return __('Create New Appointment');
		case 'edit':
			return __('Edit Appointment');
		case 'view':
			return __('Appointment');
	}
}
