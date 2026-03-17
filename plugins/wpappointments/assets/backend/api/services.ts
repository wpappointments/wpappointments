import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { Service } from '~/backend/types';

export type UpdateServiceData = Pick<
	Service,
	'id' | 'name' | 'duration' | 'description' | 'active' | 'price' | 'image'
> & {
	category?: number | null;
};

export type CreateServiceData = Pick<
	Service,
	'name' | 'duration' | 'description' | 'active' | 'price' | 'image'
> & {
	category?: number | null;
};

type UpdateResponse = APIResponse<{
	service: Service;
	message: string;
}>;

type CreateResponse = APIResponse<{
	service: Service;
	message: string;
}>;

type DeleteResponse = APIResponse<{
	serviceId: number;
}>;

export type ServicesApiOptions = {
	invalidateCache?: (selector: string) => void;
};

export function servicesApi(options?: ServicesApiOptions) {
	const apiPath = 'services';
	const { invalidateCache } = options || {};
	const dispatch = window.wp.data.dispatch('wpappointments');
	const select = window.wp.data.select('wpappointments');

	async function getServices() {
		return select.getServices();
	}

	async function createService(data: CreateServiceData) {
		const [error, response] = await resolve<CreateResponse>(async () => {
			return await apiFetch<CreateResponse>({
				path: apiPath,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(error, 'Error creating service');
		}

		if (response && response.status === 'error') {
			const err: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};

			handleError(err, 'Error creating service');
		}

		if (response && response.status === 'success') {
			const { data: responseData } = response;
			const { service } = responseData;

			dispatch.createService(service);

			displaySuccessToast(
				__('Service created successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getServices');
			}
		}

		return response;
	}

	async function updateService(data: UpdateServiceData) {
		const [error, response] = await resolve<UpdateResponse>(async () => {
			return await apiFetch<UpdateResponse>({
				path: `${apiPath}/${data.id}`,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(error, 'Error updating service');
		}

		if (response && response.status === 'error') {
			const err: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};

			handleError(err, 'Error updating service');
		}

		if (response && response.status === 'success') {
			const { data: responseData } = response;
			const { service } = responseData;

			dispatch.updateService(service);

			displaySuccessToast(
				__('Service updated successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getServices');
			}
		}

		return response;
	}

	async function deleteService(id: number) {
		if (missingId(id, 'Cannot delete service')) {
			return;
		}

		const [error, response] = await resolve<DeleteResponse>(async () => {
			const response = await apiFetch<DeleteResponse>({
				path: `${apiPath}/${id}`,
				method: 'DELETE',
			});

			dispatch.deleteService(id);

			return response;
		});

		if (error) {
			handleError(error, __('Cannot delete service', 'wpappointments'));
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Service deleted successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getServices');
			}
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);
		console.error('Error: ' + getErrorMessage(error));
	}

	const functions = {
		getServices,
		createService,
		updateService,
		deleteService,
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type ServicesApi = ReturnType<typeof servicesApi>;
