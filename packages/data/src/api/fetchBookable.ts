import type { BookableEntity } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

export async function fetchBookable(id: number) {
	const [error, result] = await resolve<
		ApiResponse<{ bookable: BookableEntity }>
	>(() => apiFetch({ path: `bookables/${id}` }));

	if (error) return { error };
	return { data: result?.data?.bookable };
}
