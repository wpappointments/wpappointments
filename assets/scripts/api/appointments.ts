import apiFetch, { APIResponse } from '~/utils/fetch';
import { Appointment } from '~/types';

type AppointmentData = {
	title: string;
	datetime: string;
};

export function appointmentsApi() {
	const dispatch = window.wp.data.dispatch('wpappointments');

	async function getAppointments() {
		const response = await apiFetch<
			APIResponse<{ appointments: Appointment[] }>
		>({
			path: 'appointment',
			method: 'GET',
		});

		const { data: responseData } = response;
		const { appointments } = responseData;

		dispatch.setAppointments(appointments);

		return response;
	}

	async function getUpcomingAppointments() {
		const response = await apiFetch<
			APIResponse<{ appointments: Appointment[] }>
		>({
			path: 'appointment/upcoming',
			method: 'GET',
		});

		const { data: responseData } = response;
		const { appointments } = responseData;

		dispatch.setUpcomingAppointments(appointments);

		return response;
	}

	async function createAppointment(data: AppointmentData) {
		const response = await apiFetch<
			APIResponse<{ appointment: Appointment; message: string }>
		>({
			path: 'appointment',
			method: 'POST',
			data,
		});

		const { data: responseData } = response;
		const { appointment } = responseData;

		dispatch.createAppointment(appointment);

		return response;
	}

	async function updateAppointment(id: number, data: AppointmentData) {
		const response = await apiFetch<
			APIResponse<{ appointment: Appointment; message: string }>
		>({
			path: `appointment/${id}`,
			method: 'PUT',
			data,
		});

		const { data: responseData } = response;
		const { appointment } = responseData;

		dispatch.updateAppointment(appointment);

		return response;
	}

	async function cancelAppointment(id: number) {
		const response = await apiFetch<
			APIResponse<{ appointment: Appointment; message: string }>
		>({
			path: `appointment/${id}/cancel`,
			method: 'PUT',
		});

		dispatch.cancelAppointment(id);

		return response;
	}

	async function deleteAppointment(id: number) {
		const response = await apiFetch<
			APIResponse<{ appointment: Appointment; message: string }>
		>({
			path: `appointment/${id}`,
			method: 'DELETE',
		});

		dispatch.deleteAppointment(id);

		return response;
	}

	const functions = {
		getAppointments,
		getUpcomingAppointments,
		createAppointment,
		updateAppointment,
		cancelAppointment,
		deleteAppointment,
	} as const;

	window.wpappointments.api.getAppointments = getAppointments;
	window.wpappointments.api.getUpcomingAppointments = getUpcomingAppointments;
	window.wpappointments.api.createAppointment = createAppointment;
	window.wpappointments.api.updateAppointment = updateAppointment;
	window.wpappointments.api.cancelAppointment = cancelAppointment;
	window.wpappointments.api.deleteAppointment = deleteAppointment;

	return functions;
}

export type AppointmentsApi = ReturnType<typeof appointmentsApi>;
