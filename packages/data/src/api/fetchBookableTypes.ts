import type { BookableTypeInfo } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

export async function fetchBookableTypes() {
	const [error, result] = await resolve<
		ApiResponse<{ types: BookableTypeInfo[] }>
	>(() => apiFetch({ path: 'bookable-types' }));

	if (error) return { error };
	return { data: result?.data?.types };
}
