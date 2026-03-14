import { __ } from '@wordpress/i18n';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { displaySuccessToast } from '~/backend/utils/toast';
import { Service } from '~/backend/types';

type Response = APIResponse<{
	services?: Service[];
	service?: Service;
	total?: number;
	message: string;
}>;

export function servicesApi() {
	const apiPath = 'services';

	async function getServices() {
		const response = await apiFetch<Response>({
			path: apiPath,
			method: 'GET',
		});

		return response.data;
	}

	async function createService(data: Partial<Service>) {
		const response = await apiFetch<Response>({
			path: apiPath,
			method: 'POST',
			data,
		});

		displaySuccessToast(
			__('Service created successfully', 'wpappointments')
		);

		return response.data;
	}

	async function updateService(id: number, data: Partial<Service>) {
		const response = await apiFetch<Response>({
			path: `${apiPath}/${id}`,
			method: 'PUT',
			data,
		});

		displaySuccessToast(
			__('Service updated successfully', 'wpappointments')
		);

		return response.data;
	}

	async function deleteService(id: number) {
		const response = await apiFetch<Response>({
			path: `${apiPath}/${id}`,
			method: 'DELETE',
		});

		displaySuccessToast(
			__('Service deleted successfully', 'wpappointments')
		);

		return response.data;
	}

	const functions = {
		getServices,
		createService,
		updateService,
		deleteService,
	} as const;

	return functions;
}

export type ServicesApi = ReturnType<typeof servicesApi>;
