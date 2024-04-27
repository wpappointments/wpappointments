import { ReactDOM } from 'react';
import 'react';
import { createRoot } from 'react-dom/client';
import { Hooks } from '@wordpress/hooks';
import 'little-state-machine';
import { actions, selectors } from '~/backend/store/store';
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
				getAppointments: AppointmentsApi['getAppointments'];
				getUpcomingAppointments: AppointmentsApi['getUpcomingAppointments'];
				createAppointment: AppointmentsApi['createAppointment'];
				updateAppointment: AppointmentsApi['updateAppointment'];
				cancelAppointment: AppointmentsApi['cancelAppointment'];
				deleteAppointment: AppointmentsApi['deleteAppointment'];
			};
			date: {
				timezones: string[];
				startOfWeek: number;
				siteTimezone: string;
				formatMaps: Record<string, string>;
				formats: Record<string, string>;
				formatsJs: Record<string, string>;
			};
			settings: {
				appointments: {
					defaultLength: number;
				};
			};
		};
		wp: WordPressGlobal;
	}
}

type OmitState<Params extends unknown[]> = Params extends []
	? []
	: Params extends [infer _, ...infer Rest]
		? Rest
		: never;

type SelectorsWithState = typeof selectors;
type SelectorsWithoutState<Selector extends keyof SelectorsWithState> = {
	[key in Selector]: (
		...arg: OmitState<Parameters<SelectorsWithState[key]>>
	) => ReturnType<SelectorsWithState[key]>;
};
type Selectors = SelectorsWithoutState<keyof SelectorsWithState>;

type WordPressGlobal = {
	data: {
		dispatch: (namespace: string) => typeof actions;
		select: (namespace: string) => Selectors;
	};
};

declare module 'little-state-machine' {
	interface GlobalState {
		currentStep: number;
		datetime: string;
	}
}

declare module 'react' {
	interface CSSProperties {
		[key: `--${string}`]: string | number;
	}
}
