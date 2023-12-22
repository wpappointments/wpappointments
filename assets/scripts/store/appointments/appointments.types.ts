import { Appointment } from '~/types';

export type AppointmentsState = {
	all: Appointment[];
	upcoming: Appointment[];
};
