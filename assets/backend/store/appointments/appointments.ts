import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/utils/fetch';
import { Appointment } from '~/types';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { State } from '../store';
import { AppointmentsState } from './appointments.types';
import { getPeriodFromTimestamp } from './utils';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, any>;

export const DEFAULT_APPOINTMENTS_STATE: AppointmentsState = {
	appointments: [],
};

export const actions = {
	setAppointments(appointments: Appointment[]) {
		return {
			type: 'SET_APPOINTMENTS',
			appointments,
		} as const;
	},
	setUpcomingAppointments(
		filtersString: string,
		appointments: Appointment[]
	) {
		return {
			type: 'SET_UPCOMING_APPOINTMENTS',
			filtersString,
			appointments,
		} as const;
	},
	createAppointment(appointment: Appointment) {
		return {
			type: 'ADD_APPOINTMENT',
			appointment,
		} as const;
	},
	updateAppointment(appointment: Appointment) {
		return {
			type: 'UPDATE_APPOINTMENT',
			appointment,
		} as const;
	},
	cancelAppointment(appointmentId: number) {
		return {
			type: 'CANCEL_APPOINTMENT',
			appointmentId,
		} as const;
	},
	deleteAppointment(appointmentId: number) {
		return {
			type: 'DELETE_APPOINTMENT',
			appointmentId,
		} as const;
	},
};

export const reducer = (state = DEFAULT_APPOINTMENTS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_APPOINTMENTS':
			return produce(state, (draft) => {
				draft.appointments = action.appointments;
			});

		case 'SET_UPCOMING_APPOINTMENTS':
			return produce(state, (draft) => {
				draft.appointments = action.appointments;
			});

		case 'ADD_APPOINTMENT':
			return produce(state, (draft) => {
				draft.appointments.push(action.appointment);
				draft.appointments.sort((a: Appointment, b: Appointment) => {
					return (
						parseInt(a.timestamp.toString()) -
						parseInt(b.timestamp.toString())
					);
				});
			});

		case 'UPDATE_APPOINTMENT':
			return produce(state, (draft) => {
				draft.appointments = draft.appointments.map(
					(appointment: Appointment) =>
						appointment.id === action.appointment.id
							? action.appointment
							: appointment
				);

				draft.appointments.sort((a: Appointment, b: Appointment) => {
					return (
						parseInt(a.timestamp.toString()) -
						parseInt(b.timestamp.toString())
					);
				});
			});

		case 'CANCEL_APPOINTMENT':
			return produce(state, (draft) => {
				draft.appointments = draft.appointments.map(
					(appointment: Appointment) =>
						appointment.id === action.appointmentId
							? {
									...appointment,
									status: 'cancelled',
							  }
							: appointment
				);
			});

		case 'DELETE_APPOINTMENT':
			return produce(state, (draft) => {
				draft.appointments = draft.appointments.filter(
					(appointment: Appointment) =>
						appointment.id !== action.appointmentId
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	getAppointments(state: State, _?: Query) {
		return state.appointments.appointments;
	},
	getUpcomingAppointments(state: State, filters?: Query) {
		return state.appointments.appointments.filter(
			(appointment: Appointment) => {
				if (!filters) {
					return true;
				}

				const { status, period } = filters;
				const periods = getPeriodFromTimestamp(
					appointment.timestamp.toString()
				);

				if (status && appointment.status !== status) {
					return false;
				}

				if (period && !periods.includes(period)) {
					return false;
				}

				return true;
			}
		);
	},
	getAppointment(state: State, id: number) {
		return state.appointments.appointments.find(
			(appointment: Appointment) => appointment.id === id
		);
	},
};

export const controls = {
	SET_APPOINTMENTS() {
		return apiFetch({ path: 'appointments' });
	},
	SET_UPCOMING_APPOINTMENTS() {
		return apiFetch({ path: 'appointments/upcoming' });
	},
};

export const resolvers = {
	*getAppointments(
		query: Query
	): Generator<
		FetchFromApiActionReturn,
		{ type: string; appointments: Appointment[] },
		APIResponse<{ appointments: Appointment[] }>
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('appointment', {
				query,
			})
		);
		const { data } = response;
		const { appointments } = data;
		return actions.setAppointments(appointments);
	},
	*getUpcomingAppointments(
		query: Query
	): Generator<
		FetchFromApiActionReturn,
		{ type: string; appointments: Appointment[] },
		APIResponse<{ appointments: Appointment[] }>
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('appointment/upcoming', {
				query,
			})
		);
		const { data } = response;
		const { appointments } = data;
		return actions.setUpcomingAppointments(
			JSON.stringify(query),
			appointments
		);
	},
};