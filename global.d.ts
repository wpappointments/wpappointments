import { Hooks } from '@wordpress/hooks';
import { ReactDOM } from 'react';
import { createRoot } from 'react-dom/client';
import { useAppointments } from '~/hooks/api/appointments';

type UseAppointments = ReturnType< typeof useAppointments >;

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
				getAppointments: UseAppointments[ 'getAppointments' ];
				getUpcomingAppointments: UseAppointments[ 'getUpcomingAppointments' ];
				createAppointment: UseAppointments[ 'createAppointment' ];
				deleteAppointment: UseAppointments[ 'deleteAppointment' ];
			};
		};
	}
}
