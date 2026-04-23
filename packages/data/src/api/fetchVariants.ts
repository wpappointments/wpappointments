import type { BookableVariant } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
