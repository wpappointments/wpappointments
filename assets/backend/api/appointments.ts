import { __ } from '@wordpress/i18n';
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
			path: 'appointment',
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
		if (invalidId(id, 'Cannot update appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `appointment/${id}`,
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
		if (invalidId(id, 'Cannot cancel appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `appointment/${id}/cancel`,
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
		if (invalidId(id, 'Cannot delete appointment')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `appointment/${id}`,
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

	function invalidId(id: number, errorPrefix: string) {
		if (!id) {
			displayErrorToast(
				`${errorPrefix}: ${__(
					'Appointment ID is required.',
					'wpappointments'
				)}`
			);

			return true;
		}

		return false;
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
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type AppointmentsApi = ReturnType<typeof appointmentsApi>;
