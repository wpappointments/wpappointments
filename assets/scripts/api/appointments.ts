import apiFetch, { APIResponse } from '~/utils/fetch';
import { Appointment } from '~/types';

type AppointmentData = {
	title: string;
	datetime: string;
};

export function appointmentsApi() {
	const dispatch = window.wp.data.dispatch('wpappointments');
	const select = window.wp.data.select('wpappointments');

	async function getAppointments() {
		return select.getAppointments();
	}

	async function getUpcomingAppointments() {
		return select.getUpcomingAppointments();
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

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type AppointmentsApi = ReturnType<typeof appointmentsApi>;
