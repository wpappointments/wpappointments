import { useDispatch } from '@wordpress/data';
import apiFetch, { APIResponse } from '~/utils/fetch';

import { store } from '~/store/store';
import { Appointment } from '~/types';

type AppointmentData = {
	title: string;
	datetime: string;
};

export function useAppointments() {
	const dispatch = useDispatch(store);

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
		deleteAppointment,
	} as const;

	window.wpappointments.api.getAppointments = getAppointments;
	window.wpappointments.api.getUpcomingAppointments = getUpcomingAppointments;
	window.wpappointments.api.createAppointment = createAppointment;
	window.wpappointments.api.deleteAppointment = deleteAppointment;

	return functions;
}
