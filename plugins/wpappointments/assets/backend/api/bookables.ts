import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { BookableEntity, BookableVariant, BookableType } from '~/backend/types';

export type CreateBookableData = Pick<
	BookableEntity,
	'name' | 'type' | 'description' | 'active' | 'duration' | 'image'
> & {
	bufferBefore?: number;
	bufferAfter?: number;
	minLeadTime?: number;
	maxLeadTime?: number;
	attributes?: Array<{ name: string; values: string[] }>;
};

export type UpdateBookableData = Pick<BookableEntity, 'id'> &
	Partial<CreateBookableData>;

type GetAllResponse = APIResponse<{
	bookables: BookableEntity[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
}>;

type MutateResponse = APIResponse<{
	bookable: BookableEntity;
}>;

type DeleteResponse = APIResponse<{
	bookableId: number;
}>;

type VariantsResponse = APIResponse<{
	variants: BookableVariant[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
}>;

type VariantMutateResponse = APIResponse<{
	variant: BookableVariant;
}>;

type VariantDeleteResponse = APIResponse<{
	variantId: number;
}>;

type GenerateVariantsResponse = APIResponse<{
	variants: BookableVariant[];
}>;

type TypesResponse = APIResponse<{
	types: BookableType[];
}>;

type AvailabilityResponse = APIResponse<{
	variantId: number;
	availability: Record<string, unknown>;
}>;

export type BookablesApiOptions = {
	invalidateCache?: (selector: string) => void;
};

export function bookablesApi(options?: BookablesApiOptions) {
	const apiPath = 'bookables';
	const { invalidateCache } = options || {};

	async function getBookables(params?: {
		type?: string;
		active?: boolean;
		paged?: number;
		per_page?: number;
	}) {
		const query = new URLSearchParams();
		if (params?.type) query.set('type', params.type);
		if (params?.active !== undefined)
			query.set('active', String(params.active));
		if (params?.paged) query.set('paged', String(params.paged));
		if (params?.per_page) query.set('per_page', String(params.per_page));

		const path = query.toString()
			? `${apiPath}?${query.toString()}`
			: apiPath;

		const [error, response] = await resolve<GetAllResponse>(async () => {
			return await apiFetch<GetAllResponse>({ path });
		});

		if (error) {
			handleError(
				error,
				__('Error fetching bookable entities', 'wpappointments')
			);
			return null;
		}

		return response;
	}

	async function createBookable(data: CreateBookableData) {
		const [error, response] = await resolve<MutateResponse>(async () => {
			return await apiFetch<MutateResponse>({
				path: apiPath,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(
				error,
				__('Error creating bookable entity', 'wpappointments')
			);
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Bookable entity created successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getBookables');
			}
		}

		return response;
	}

	async function updateBookable(data: UpdateBookableData) {
		const [error, response] = await resolve<MutateResponse>(async () => {
			return await apiFetch<MutateResponse>({
				path: `${apiPath}/${data.id}`,
				method: 'POST',
				data,
			});
		});

		if (error) {
			handleError(
				error,
				__('Error updating bookable entity', 'wpappointments')
			);
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Bookable entity updated successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getBookables');
			}
		}

		return response;
	}

	async function deleteBookable(id: number) {
		if (missingId(id, 'Cannot delete bookable entity')) {
			return;
		}

		const [error, response] = await resolve<DeleteResponse>(async () => {
			return await apiFetch<DeleteResponse>({
				path: `${apiPath}/${id}`,
				method: 'DELETE',
			});
		});

		if (error) {
			handleError(
				error,
				__('Cannot delete bookable entity', 'wpappointments')
			);
			return;
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Bookable entity deleted successfully', 'wpappointments')
			);
			if (invalidateCache) {
				invalidateCache('getBookables');
			}
		}

		return response;
	}

	async function getVariants(entityId: number) {
		const [error, response] = await resolve<VariantsResponse>(async () => {
			return await apiFetch<VariantsResponse>({
				path: `${apiPath}/${entityId}/variants`,
			});
		});

		if (error) {
			handleError(error, __('Error fetching variants', 'wpappointments'));
			return null;
		}

		return response;
	}

	async function createVariant(
		entityId: number,
		data: Partial<BookableVariant>
	) {
		const [error, response] = await resolve<VariantMutateResponse>(
			async () => {
				return await apiFetch<VariantMutateResponse>({
					path: `${apiPath}/${entityId}/variants`,
					method: 'POST',
					data,
				});
			}
		);

		if (error) {
			handleError(error, __('Error creating variant', 'wpappointments'));
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Variant created successfully', 'wpappointments')
			);
		}

		return response;
	}

	async function updateVariant(
		entityId: number,
		variantId: number,
		data: Partial<BookableVariant>
	) {
		const [error, response] = await resolve<VariantMutateResponse>(
			async () => {
				return await apiFetch<VariantMutateResponse>({
					path: `${apiPath}/${entityId}/variants/${variantId}`,
					method: 'POST',
					data,
				});
			}
		);

		if (error) {
			handleError(error, __('Error updating variant', 'wpappointments'));
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Variant updated successfully', 'wpappointments')
			);
		}

		return response;
	}

	async function deleteVariant(entityId: number, variantId: number) {
		const [error, response] = await resolve<VariantDeleteResponse>(
			async () => {
				return await apiFetch<VariantDeleteResponse>({
					path: `${apiPath}/${entityId}/variants/${variantId}`,
					method: 'DELETE',
				});
			}
		);

		if (error) {
			handleError(error, __('Cannot delete variant', 'wpappointments'));
			return;
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Variant deleted successfully', 'wpappointments')
			);
		}

		return response;
	}

	async function generateVariants(entityId: number) {
		const [error, response] = await resolve<GenerateVariantsResponse>(
			async () => {
				return await apiFetch<GenerateVariantsResponse>({
					path: `${apiPath}/${entityId}/variants/generate`,
					method: 'POST',
				});
			}
		);

		if (error) {
			handleError(
				error,
				__('Error generating variants', 'wpappointments')
			);
		}

		if (response && response.status === 'success') {
			displaySuccessToast(
				__('Variants generated successfully', 'wpappointments')
			);
		}

		return response;
	}

	async function getBookableTypes() {
		const [error, response] = await resolve<TypesResponse>(async () => {
			return await apiFetch<TypesResponse>({ path: 'bookable-types' });
		});

		if (error) {
			handleError(
				error,
				__('Error fetching bookable types', 'wpappointments')
			);
			return [];
		}

		return response?.data?.types ?? [];
	}

	async function getVariantAvailability(
		variantId: number,
		startDate?: string,
		endDate?: string
	) {
		const query = new URLSearchParams();
		if (startDate) query.set('start_date', startDate);
		if (endDate) query.set('end_date', endDate);

		const path = query.toString()
			? `bookable-availability/${variantId}?${query.toString()}`
			: `bookable-availability/${variantId}`;

		const [error, response] = await resolve<AvailabilityResponse>(
			async () => {
				return await apiFetch<AvailabilityResponse>({ path });
			}
		);

		if (error) {
			handleError(
				error,
				__('Error fetching availability', 'wpappointments')
			);
			return null;
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);
		console.error('Error: ' + getErrorMessage(error));
	}

	return {
		getBookables,
		createBookable,
		updateBookable,
		deleteBookable,
		getVariants,
		createVariant,
		updateVariant,
		deleteVariant,
		generateVariants,
		getBookableTypes,
		getVariantAvailability,
	};
}

export type BookablesApi = ReturnType<typeof bookablesApi>;
