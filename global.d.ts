import { ReactDOM } from 'react';
import 'react';
import { createRoot } from 'react-dom/client';
import { Hooks } from '@wordpress/hooks';
import 'little-state-machine';
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
			date: {
				timezones: string[];
				startOfWeek: number;
				siteTimezone: string;
				formatMaps: Record<string, string>;
				formats: Record<string, string>;
				formatsJs: Record<string, string>;
			};
		};
		wp: any;
	}
}

declare module 'little-state-machine' {
	interface GlobalState {
		currentStep: number;
		datetime: string;
	}
}

declare module 'react' {
	interface CSSProperties {
		[ key: `--${ string }` ]: string | number;
	}
}
