import { ReactDOM } from 'react';
import { createRoot } from 'react-dom/client';
import { Hooks } from '@wordpress/hooks';
import type { AppointmentsApi } from '~/backend/api/appointments';

declare global {
	interface Window {
		ReactDOM: ReactDOM & {
			createRoot: typeof createRoot;
		};
		wpappointments: {
			hooks: Hooks;
			api: {
				root: string;
				namespace: string;
				url: string;
				nonce: string;
				getAppointments: AppointmentsApi[ 'getAppointments' ];
				getUpcomingAppointments: AppointmentsApi[ 'getUpcomingAppointments' ];
				createAppointment: AppointmentsApi[ 'createAppointment' ];
				updateAppointment: AppointmentsApi[ 'updateAppointment' ];
				cancelAppointment: AppointmentsApi[ 'cancelAppointment' ];
				deleteAppointment: AppointmentsApi[ 'deleteAppointment' ];
			};
		};
		wp: any;
	}
}
