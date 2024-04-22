import { Appointment } from '~/backend/types';

export type AppointmentsState = {
	appointments: Appointment[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};
