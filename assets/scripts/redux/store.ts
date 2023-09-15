import { createReduxStore, register } from '@wordpress/data';
import apiFetch, { APIResponse } from '../react/utils/fetch';
import { Appointment } from '../types';
import { produce } from 'immer';

// import { reducer as appointmentsReducer } from './appointments';
// import { reducer as appointmentsSettingsReducer } from './appointments-settings';
// import { reducer as appointmentsSettingsGeneralReducer } from './appointments-settings-general';
// import { reducer as appointmentsSettingsPaymentsReducer } from './appointments-settings-payments';
// import { reducer as appointmentsSettingsPaymentsStripeReducer } from './appointments-settings-payments-stripe';
// import { reducer as appointmentsSettingsPaymentsPayPalReducer } from './appointments-settings-payments-paypal';

export type DayOpeningHours = {
	day: keyof State[ 'settings' ][ 'schedule' ];
	enabled: boolean;
	slots: {
		list: {
			start: {
				hour: string;
				minute: string;
			};
			end: {
				hour: string;
				minute: string;
			};
		}[];
	};
};

type State = {
	upcomingAppointments: Appointment[];
	settings: {
		general: {
			firstName: string;
			lastName: string;
			phoneNumber: string;
			companyName: string;
		};
		schedule: {
			monday: DayOpeningHours;
			tuesday: DayOpeningHours;
			wednesday: DayOpeningHours;
			thursday: DayOpeningHours;
			friday: DayOpeningHours;
			saturday: DayOpeningHours;
			sunday: DayOpeningHours;
		};
	};
};

function getDefaultOpeningHours(
	day: keyof State[ 'settings' ][ 'schedule' ],
	isEnabled: boolean
) {
	return {
		day,
		enabled: isEnabled,
		slots: {
			list: [
				{
					start: {
						hour: '10',
						minute: '00',
					},
					end: {
						hour: '18',
						minute: '00',
					},
				},
			],
		},
	};
}

export const DEFAULT_STATE: State = {
	upcomingAppointments: [],
	settings: {
		general: {
			firstName: '',
			lastName: '',
			phoneNumber: '',
			companyName: '',
		},
		schedule: {
			monday: getDefaultOpeningHours( 'monday', false ),
			tuesday: getDefaultOpeningHours( 'tuesday', false ),
			wednesday: getDefaultOpeningHours( 'wednesday', false ),
			thursday: getDefaultOpeningHours( 'thursday', false ),
			friday: getDefaultOpeningHours( 'friday', false ),
			saturday: getDefaultOpeningHours( 'saturday', false ),
			sunday: getDefaultOpeningHours( 'sunday', false ),
		},
	},
};

const actions = {
	setUpcomingAppointments( appointments: Appointment[] ) {
		return {
			type: 'SET_UPCOMING_APPOINTMENTS',
			appointments,
		} as const;
	},
	addAppointment( appointment: Appointment ) {
		return {
			type: 'ADD_APPOINTMENT',
			appointment,
		} as const;
	},
	deleteAppointment( appointmentId: number ) {
		return {
			type: 'DELETE_APPOINTMENT',
			appointmentId,
		} as const;
	},
	setPluginSettings( settings: Partial< State[ 'settings' ] > ) {
		return {
			type: 'SET_PLUGIN_SETTINGS',
			settings,
		} as const;
	},
	updateWorkingHours( data: DayOpeningHours ) {
		return {
			type: 'UPDATE_WORKING_HOURS',
			data,
		} as const;
	},
	addWorkingHoursSlot( day: keyof State[ 'settings' ][ 'schedule' ] ) {
		return {
			type: 'ADD_WORKING_HOURS_SLOT',
			day,
		} as const;
	},
	removeWorkingHoursSlot(
		day: keyof State[ 'settings' ][ 'schedule' ],
		index: number
	) {
		return {
			type: 'REMOVE_WORKING_HOURS_SLOT',
			day,
			index,
		} as const;
	},
	copyWorkingHoursToAllDays( data: DayOpeningHours ) {
		return {
			type: 'COPY_WORKING_HOURS_TO_ALL_DAYS',
			data,
		} as const;
	},
	fetchFromAPI( path: string ) {
		return {
			type: 'FETCH_FROM_API',
			path,
		} as const;
	},
};

type ActionsType = typeof actions;
type Action = ReturnType< ActionsType[ keyof ActionsType ] >;

export const store = createReduxStore( 'wpappointments', {
	reducer( state: State = DEFAULT_STATE, action: Action ) {
		switch ( action.type ) {
			case 'SET_PLUGIN_SETTINGS':
				return produce( state, ( draft ) => {
					draft.settings.general = {
						...draft.settings.general,
						...action.settings.general,
					};
					draft.settings.schedule = {
						...draft.settings.schedule,
						...action.settings.schedule,
					};
				} );

			case 'UPDATE_WORKING_HOURS':
				return produce( state, ( draft ) => {
					const day = action.data.day;

					draft.settings.schedule[ day ] = {
						...draft.settings.schedule[ day ],
						...action.data,
					};
				} );

			case 'ADD_WORKING_HOURS_SLOT':
				return produce( state, ( draft ) => {
					const day = action.day;

					draft.settings.schedule[ day ].slots.list.push( {
						start: {
							hour: '10',
							minute: '00',
						},
						end: {
							hour: '18',
							minute: '00',
						},
					} );
				} );

			case 'REMOVE_WORKING_HOURS_SLOT':
				return produce( state, ( draft ) => {
					const day = action.day;
					const index = action.index;

					draft.settings.schedule[ day ].slots.list.splice(
						index,
						1
					);
				} );

			case 'COPY_WORKING_HOURS_TO_ALL_DAYS':
				return produce( state, ( draft ) => {
					const createCopyFor = ( day = action.data.day ) => ( {
						...draft.settings.schedule[ day ],
						...{
							...action.data,
							day: day,
							enabled: state.settings.schedule[ day ].enabled,
						},
					} );

					draft.settings.schedule = {
						...draft.settings.schedule,
						tuesday: createCopyFor( 'tuesday' ),
						wednesday: createCopyFor( 'wednesday' ),
						thursday: createCopyFor( 'thursday' ),
						friday: createCopyFor( 'friday' ),
						saturday: createCopyFor( 'saturday' ),
						sunday: createCopyFor( 'sunday' ),
					};
				} );

			case 'SET_UPCOMING_APPOINTMENTS':
				return {
					...state,
					upcomingAppointments: action.appointments,
				};

			case 'ADD_APPOINTMENT':
				return {
					...state,
					upcomingAppointments: [
						...state.upcomingAppointments,
						action.appointment,
					],
				};

			case 'DELETE_APPOINTMENT':
				return {
					...state,
					upcomingAppointments: state.upcomingAppointments.filter(
						( appointment: Appointment ) =>
							appointment.id !== action.appointmentId
					),
				};

			default:
				return state;
		}
	},

	actions,

	selectors: {
		getUpcomingAppointments( state: State ) {
			return state.upcomingAppointments;
		},
		getSettings( state: State, category: keyof State[ 'settings' ] ) {
			return state.settings[ category ];
		},
	},

	controls: {
		SET_UPCOMING_APPOINTMENTS() {
			return apiFetch( { path: 'appointments' } );
		},
		SET_PLUGIN_SETTINGS() {
			return apiFetch( { path: 'settings' } );
		},
		FETCH_FROM_API( action: any ) {
			return apiFetch( { path: action.path } );
		},
	},

	resolvers: {
		*getSettings(): Generator<
			ReturnType< typeof actions.fetchFromAPI >,
			{ type: string; settings: Partial< State[ 'settings' ] > },
			APIResponse< { settings: State[ 'settings' ] } >
		> {
			yield actions.fetchFromAPI( 'settings' );
			const response = yield actions.fetchFromAPI( 'settings' );
			const { data } = response;
			const { settings } = data;
			return actions.setPluginSettings( settings );
		},
		*getUpcomingAppointments(): Generator<
			ReturnType< typeof actions.fetchFromAPI >,
			{ type: string; appointments: Appointment[] },
			APIResponse< { appointments: Appointment[] } >
		> {
			yield actions.fetchFromAPI( 'appointment' );
			const response = yield actions.fetchFromAPI( 'appointment' );
			const { data } = response;
			const { appointments } = data;
			return actions.setUpcomingAppointments( appointments );
		},
	},
} );

register( store );
