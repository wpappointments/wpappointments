import apiFetch, { APIResponse } from '~/utils/fetch';
import { Appointment } from '~/types';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { State } from '../store';
import { AppointmentsState } from './appointments.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_APPOINTMENTS_STATE: AppointmentsState = {
	all: [],
	upcoming: [],
};

export const actions = {
	setAppointments(appointments: Appointment[]) {
		return {
			type: 'SET_APPOINTMENTS',
			appointments,
		} as const;
	},
	setUpcomingAppointments(appointments: Appointment[]) {
		return {
			type: 'SET_UPCOMING_APPOINTMENTS',
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
			return {
				...state,
				all: action.appointments,
			};

		case 'SET_UPCOMING_APPOINTMENTS':
			return {
				...state,
				upcoming: action.appointments,
			};

		case 'ADD_APPOINTMENT':
			return {
				...state,
				upcoming: [...state.upcoming, action.appointment]
					.sort(
						(a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
					)
					.slice(0, 10),
				all: [...state.all, action.appointment],
			};

		case 'UPDATE_APPOINTMENT':
			return {
				...state,
				upcoming: state.upcoming.map((appointment: Appointment) =>
					appointment.id === action.appointment.id
						? action.appointment
						: appointment
				),
				all: state.all.map((appointment: Appointment) =>
					appointment.id === action.appointment.id
						? action.appointment
						: appointment
				),
			};

		case 'CANCEL_APPOINTMENT':
			return {
				...state,
				upcoming: state.upcoming.filter(
					(appointment: Appointment) =>
						appointment.id !== action.appointmentId
				),
				all: state.all.map((appointment: Appointment) =>
					appointment.id === action.appointmentId
						? {
								...appointment,
								status: 'cancelled',
						  }
						: appointment
				),
			};

		case 'DELETE_APPOINTMENT':
			return {
				...state,
				upcoming: state.upcoming.filter(
					(appointment: Appointment) =>
						appointment.id !== action.appointmentId
				),
				all: state.all.filter(
					(appointment: Appointment) =>
						appointment.id !== action.appointmentId
				),
			};

		default:
			return state;
	}
};

export const selectors = {
	getAppointments(state: State) {
		return state.appointments.all;
	},
	getUpcomingAppointments(state: State) {
		return state.appointments.upcoming;
	},
	getAppointment(state: State, id: number) {
		return state.appointments.all.find(
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
	getAppointments,
	getAppointment: getAppointments,
	*getUpcomingAppointments(): Generator<
		FetchFromApiActionReturn,
		{ type: string; appointments: Appointment[] },
		APIResponse<{ appointments: Appointment[] }>
	> {
		const response = yield baseActions.fetchFromAPI('appointment/upcoming');
		const { data } = response;
		const { appointments } = data;
		return actions.setUpcomingAppointments(appointments);
	},
};

function* getAppointments(): Generator<
	FetchFromApiActionReturn,
	{ type: string; appointments: Appointment[] },
	APIResponse<{ appointments: Appointment[] }>
> {
	const response = yield baseActions.fetchFromAPI('appointment');
	const { data } = response;
	const { appointments } = data;
	return actions.setAppointments(appointments);
}
