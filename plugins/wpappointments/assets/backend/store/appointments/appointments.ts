import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { Appointment } from '~/backend/types';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { State } from '../store';
import { AppointmentsState } from './appointments.types';
import { getStrictPeriodFromTimestamp } from './utils';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, any>;
type Response = APIResponse<AppointmentsState>;

export const DEFAULT_APPOINTMENTS_STATE: AppointmentsState = {
	appointments: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setAppointments({
		appointments,
		totalItems,
		totalPages,
		postsPerPage,
		currentPage,
	}: AppointmentsState) {
		return {
			type: 'SET_APPOINTMENTS',
			appointments,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage,
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
	confirmAppointment(appointmentId: number) {
		return {
			type: 'CONFIRM_APPOINTMENT',
			appointmentId,
		} as const;
	},
};

export const reducer = (state = DEFAULT_APPOINTMENTS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_APPOINTMENTS':
			return produce(state, () => {
				return action;
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

		case 'CONFIRM_APPOINTMENT':
			return produce(state, (draft) => {
				draft.appointments = draft.appointments.map(
					(appointment: Appointment) =>
						appointment.id === action.appointmentId
							? {
									...appointment,
									status: 'confirmed',
								}
							: appointment
				);
			});
		default:
			return state;
	}
};

export const selectors = {
	getAppointments(state: State, _?: Query) {
		return state.appointments;
	},
	getUpcomingAppointments(state: State, filters?: Query) {
		return state.appointments.appointments.filter(
			(appointment: Appointment) => {
				const { status, period } = filters || {};

				let statuses = [];

				if (typeof status === 'string') {
					statuses = [status];
				} else if (Array.isArray(status)) {
					statuses = status;
				}

				const periodCompare = getStrictPeriodFromTimestamp(
					appointment.timestamp
				);

				if (
					status &&
					appointment.status &&
					!statuses.includes(appointment.status)
				) {
					return false;
				}

				if (period && periodCompare !== period) {
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
		Response
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('appointments', {
				query,
			})
		);
		const { data } = response;

		return actions.setAppointments(data);
	},
};
