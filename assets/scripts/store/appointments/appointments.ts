import apiFetch, { APIResponse } from '~/utils/fetch';
import { Appointment } from '~/types';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { State } from '../store';
import { AppointmentsState } from './appointments.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_APPOINTMENTS_STATE: AppointmentsState = {
	upcoming: [],
};

export const actions = {
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
	deleteAppointment(appointmentId: number) {
		return {
			type: 'DELETE_APPOINTMENT',
			appointmentId,
		} as const;
	},
};

export const reducer = (state = DEFAULT_APPOINTMENTS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_UPCOMING_APPOINTMENTS':
			return {
				...state,
				upcoming: action.appointments,
			};

		case 'ADD_APPOINTMENT':
			return {
				...state,
				upcoming: [...state.upcoming, action.appointment]
					.sort((a, b) => a.timestamp - b.timestamp)
					.slice(0, 10),
			};

		case 'DELETE_APPOINTMENT':
			return {
				...state,
				upcoming: state.upcoming.filter(
					(appointment: Appointment) =>
						appointment.id !== action.appointmentId
				),
			};

		default:
			return state;
	}
};

export const selectors = {
	getUpcomingAppointments(state: State) {
		return state.appointments.upcoming;
	},
};

export const controls = {
	SET_UPCOMING_APPOINTMENTS() {
		return apiFetch({ path: 'appointments' });
	},
};

export const resolvers = {
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
