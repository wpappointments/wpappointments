/**
 * Bookable API client
 *
 * Shared API client functions for bookable entities, variants, and
 * availability. Plugins building bookable type UIs use these to
 * interact with the REST API.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import apiFetch from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type {
	BookableEntity,
	BookableVariant,
	BookableTypeInfo,
	AvailabilityData,
} from './types';

type ApiResponse<T> = {
	status: string;
	message: string;
	data: T;
};

/**
 * Fetch all bookable entities, optionally filtered by type
 */
export async function fetchBookables(params?: {
	type?: string;
	active?: boolean;
	postsPerPage?: number;
	paged?: number;
}) {
	const queryParams = new URLSearchParams();

	if (params?.type) queryParams.set('type', params.type);
	if (params?.active !== undefined)
		queryParams.set('active', String(params.active));
	if (params?.postsPerPage)
		queryParams.set('postsPerPage', String(params.postsPerPage));
	if (params?.paged) queryParams.set('paged', String(params.paged));

	const query = queryParams.toString();
	const path = `bookables${query ? `?${query}` : ''}`;

	const [error, result] = await resolve<
		ApiResponse<{
			bookables: BookableEntity[];
			totalItems: number;
			totalPages: number;
			postsPerPage: number;
			currentPage: number;
		}>
	>(() => apiFetch({ path }));

	if (error) return { error };
	return { data: result?.data };
}

/**
 * Fetch a single bookable entity by ID
 */
export async function fetchBookable(id: number) {
	const [error, result] = await resolve<
		ApiResponse<{ bookable: BookableEntity }>
	>(() => apiFetch({ path: `bookables/${id}` }));

	if (error) return { error };
	return { data: result?.data?.bookable };
}

/**
 * Create a new bookable entity
 */
export async function createBookable(data: Partial<BookableEntity>) {
	const [error, result] = await resolve<
		ApiResponse<{ bookable: BookableEntity }>
	>(() =>
		apiFetch({
			path: '/bookables',
			method: 'POST',
			data,
		})
	);

	if (error) return { error };
	return { data: result?.data?.bookable };
}

/**
 * Update an existing bookable entity
 */
export async function updateBookable(
	id: number,
	data: Partial<BookableEntity>
) {
	const [error, result] = await resolve<
		ApiResponse<{ bookable: BookableEntity }>
	>(() =>
		apiFetch({
			path: `bookables/${id}`,
			method: 'POST',
			data,
		})
	);

	if (error) return { error };
	return { data: result?.data?.bookable };
}

/**
 * Delete a bookable entity
 */
export async function deleteBookable(id: number) {
	const [error, result] = await resolve<ApiResponse<{ id: number }>>(() =>
		apiFetch({
			path: `bookables/${id}`,
			method: 'DELETE',
		})
	);

	if (error) return { error };
	return { data: result?.data };
}

/**
 * Fetch all variants for a bookable entity
 */
export async function fetchVariants(entityId: number) {
	const [error, result] = await resolve<
		ApiResponse<{
			variants: BookableVariant[];
			totalItems: number;
			totalPages: number;
			postsPerPage: number;
			currentPage: number;
		}>
	>(() => apiFetch({ path: `bookables/${entityId}/variants` }));

	if (error) return { error };
	return { data: result?.data };
}

/**
 * Fetch a single variant
 */
export async function fetchVariant(entityId: number, variantId: number) {
	const [error, result] = await resolve<
		ApiResponse<{ variant: BookableVariant }>
	>(() => apiFetch({ path: `bookables/${entityId}/variants/${variantId}` }));

	if (error) return { error };
	return { data: result?.data?.variant };
}

/**
 * Create a variant
 */
export async function createVariant(
	entityId: number,
	data: Partial<BookableVariant>
) {
	const [error, result] = await resolve<
		ApiResponse<{ variant: BookableVariant }>
	>(() =>
		apiFetch({
			path: `bookables/${entityId}/variants`,
			method: 'POST',
			data,
		})
	);

	if (error) return { error };
	return { data: result?.data?.variant };
}

/**
 * Update a variant
 */
export async function updateVariant(
	entityId: number,
	variantId: number,
	data: Partial<BookableVariant>
) {
	const [error, result] = await resolve<
		ApiResponse<{ variant: BookableVariant }>
	>(() =>
		apiFetch({
			path: `bookables/${entityId}/variants/${variantId}`,
			method: 'POST',
			data,
		})
	);

	if (error) return { error };
	return { data: result?.data?.variant };
}

/**
 * Delete a variant
 */
export async function deleteVariant(entityId: number, variantId: number) {
	const [error, result] = await resolve<ApiResponse<{ id: number }>>(() =>
		apiFetch({
			path: `bookables/${entityId}/variants/${variantId}`,
			method: 'DELETE',
		})
	);

	if (error) return { error };
	return { data: result?.data };
}

/**
 * Generate variants from attribute matrix
 */
export async function generateVariants(entityId: number) {
	const [error, result] = await resolve<
		ApiResponse<{ variants: BookableVariant[] }>
	>(() =>
		apiFetch({
			path: `bookables/${entityId}/variants/generate`,
			method: 'POST',
		})
	);

	if (error) return { error };
	return { data: result?.data?.variants };
}

/**
 * Fetch effective availability for a variant
 */
export async function fetchVariantAvailability(
	variantId: number,
	dateRange?: { startDate?: string; endDate?: string }
) {
	const queryParams = new URLSearchParams();

	if (dateRange?.startDate)
		queryParams.set('start_date', dateRange.startDate);
	if (dateRange?.endDate) queryParams.set('end_date', dateRange.endDate);

	const query = queryParams.toString();
	const path = `bookable-availability/${variantId}${query ? `?${query}` : ''}`;

	const [error, result] = await resolve<
		ApiResponse<{ availability: AvailabilityData }>
	>(() => apiFetch({ path }));

	if (error) return { error };
	return { data: result?.data?.availability };
}

/**
 * Fetch availability for all variants of an entity
 */
export async function fetchEntityAvailability(
	entityId: number,
	dateRange?: { startDate?: string; endDate?: string }
) {
	const queryParams = new URLSearchParams();

	if (dateRange?.startDate)
		queryParams.set('start_date', dateRange.startDate);
	if (dateRange?.endDate) queryParams.set('end_date', dateRange.endDate);

	const query = queryParams.toString();
	const path = `bookables/${entityId}/availability${query ? `?${query}` : ''}`;

	const [error, result] = await resolve<
		ApiResponse<{
			variants: Array<{
				variant: BookableVariant;
				availability: AvailabilityData;
			}>;
		}>
	>(() => apiFetch({ path }));

	if (error) return { error };
	return { data: result?.data?.variants };
}

/**
 * Fetch all registered bookable types
 */
export async function fetchBookableTypes() {
	const [error, result] = await resolve<
		ApiResponse<{ types: BookableTypeInfo[] }>
	>(() => apiFetch({ path: 'bookable-types' }));

	if (error) return { error };
	return { data: result?.data?.types };
}
