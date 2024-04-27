import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { Appointment } from '~/backend/types';

type AppointmentData = {
	service: string;
	customer: string;
	customerId: number;
};

type Response = APIResponse<{
	appointment: Appointment;
	message: string;
}>;

export function appointmentsApi({
	invalidateCache,
}: {
	invalidateCache?: (selector: string) => void;
}) {
	const apiPath = 'appointments';
	const dispatch = window.wp.data.dispatch('wpappointments');
	const select = window.wp.data.select('wpappointments');

	async function getAppointments() {
		return select.getAppointments();
	}

	async function getUpcomingAppointments() {
		return select.getUpcomingAppointments();
	}

	async function createAppointment(data: AppointmentData) {
		const response = await apiFetch<Response>({
			path: 'appointments',
			method: 'POST',
			data,
		});

		const { data: responseData } = response;
		const { appointment } = responseData;

		dispatch.createAppointment(appointment);

		displaySuccessToast(
			__('Appointment created successfully', 'wpappointments')
		);

		if (invalidateCache) {
			invalidateCache('getAppointments');
			invalidateCache('getUpcomingAppointments');
		}

		return response;
	}

	async function updateAppointment(id: number, data: AppointmentData) {
		if (missingId(id, 'Cannot update appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `${apiPath}/${id}`,
				method: 'PUT',
				data,
			});

			const { data: responseData } = response;
			const { appointment } = responseData;

			dispatch.updateAppointment(appointment);

			return response;
		});

		if (error) {
			handleError(
				error,
				__('Cannot update appointment', 'wpappointments')
			);
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Appointment updated successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getAppointments');
				invalidateCache('getUpcomingAppointments');
			}
		}

		return response;
	}

	async function cancelAppointment(id: number) {
		if (missingId(id, 'Cannot cancel appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `${apiPath}/${id}/cancel`,
				method: 'PUT',
			});

			dispatch.cancelAppointment(id);

			return response;
		});

		if (error) {
			handleError(
				error,
				__('Cannot cancel appointment', 'wpappointments')
			);
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Appointment cancelled successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getAppointments');
				invalidateCache('getUpcomingAppointments');
			}
		}

		return response;
	}

	async function deleteAppointment(id: number) {
		if (missingId(id, 'Cannot delete appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `${apiPath}/${id}`,
				method: 'DELETE',
			});

			dispatch.deleteAppointment(id);

			return response;
		});

		if (error) {
			handleError(
				error,
				__('Cannot delete appointment', 'wpappointments')
			);
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Appointment deleted successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getAppointments');
				invalidateCache('getUpcomingAppointments');
			}
		}

		return response;
	}

	async function confirmAppointment(id: number) {
		if (missingId(id, 'Cannot confirm appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `${apiPath}/${id}/confirm`,
				method: 'PUT',
			});

			dispatch.confirmAppointment(id);

			return response;
		});

		if (error) {
			handleError(
				error,
				__('Cannot confirm appointment', 'wpappointments')
			);
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Appointment confirmed successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getAppointments');
				invalidateCache('getUpcomingAppointments');
			}
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);
		console.error('Error: ' + getErrorMessage(error));
	}

	const functions = {
		getAppointments,
		getUpcomingAppointments,
		createAppointment,
		updateAppointment,
		cancelAppointment,
		deleteAppointment,
		confirmAppointment,
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type AppointmentsApi = ReturnType<typeof appointmentsApi>;
