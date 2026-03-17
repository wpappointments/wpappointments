import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { ServiceCategory } from '~/backend/types';

export type CreateServiceCategoryData = Pick<ServiceCategory, 'name'>;
export type UpdateServiceCategoryData = Pick<ServiceCategory, 'id' | 'name'>;

type GetAllResponse = APIResponse<{
	categories: ServiceCategory[];
	message: string;
}>;
type MutateResponse = APIResponse<{
	category: ServiceCategory;
	message: string;
}>;
type DeleteResponse = APIResponse<{ categoryId: number }>;

export type ServiceCategoriesApiOptions = {
	invalidateCache?: (selector: string) => void;
};

export function serviceCategoriesApi(options?: ServiceCategoriesApiOptions) {
	const apiPath = 'service-categories';
	const { invalidateCache } = options || {};
	const dispatch = window.wp.data.dispatch('wpappointments');

	async function getServiceCategories(): Promise<ServiceCategory[]> {
		const [error, response] = await resolve<GetAllResponse>(async () => {
			return await apiFetch<GetAllResponse>({ path: apiPath });
		});

		if (error) {
			handleError(error, 'Error fetching service categories');
			return [];
		}

		return response?.data?.categories ?? [];
	}

	async function createServiceCategory(data: CreateServiceCategoryData) {
		const [error, response] = await resolve<MutateResponse>(async () => {
			return await apiFetch<MutateResponse>({
				path: apiPath,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(error, 'Error creating service category');
		}

		if (response && response.status === 'error') {
			const err: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};
			handleError(err, 'Error creating service category');
		}

		if (response && response.status === 'success') {
			const { category } = response.data;
			dispatch.createServiceCategory(category);
			displaySuccessToast(
				__('Service category created successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getServiceCategories');
			}
		}

		return response;
	}

	async function updateServiceCategory(data: UpdateServiceCategoryData) {
		const [error, response] = await resolve<MutateResponse>(async () => {
			return await apiFetch<MutateResponse>({
				path: `${apiPath}/${data.id}`,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(error, 'Error updating service category');
		}

		if (response && response.status === 'error') {
			const err: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};
			handleError(err, 'Error updating service category');
		}

		if (response && response.status === 'success') {
			const { category } = response.data;
			dispatch.updateServiceCategory(category);
			displaySuccessToast(
				__('Service category updated successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getServiceCategories');
			}
		}

		return response;
	}

	async function deleteServiceCategory(id: number) {
		if (missingId(id, 'Cannot delete service category')) {
			return;
		}

		const [error, response] = await resolve<DeleteResponse>(async () => {
			const res = await apiFetch<DeleteResponse>({
				path: `${apiPath}/${id}`,
				method: 'DELETE',
			});
			dispatch.deleteServiceCategory(id);
			return res;
		});

		if (error) {
			handleError(
				error,
				__('Cannot delete service category', 'wpappointments')
			);
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Service category deleted successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getServiceCategories');
			}
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);
		console.error('Error: ' + getErrorMessage(error));
	}

	return {
		getServiceCategories,
		createServiceCategory,
		updateServiceCategory,
		deleteServiceCategory,
	};
}

export type ServiceCategoriesApi = ReturnType<typeof serviceCategoriesApi>;
