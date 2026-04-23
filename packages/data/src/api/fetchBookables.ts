import type { BookableEntity } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
