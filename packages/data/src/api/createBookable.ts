import type { BookableEntity } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

export async function createBookable(data: Partial<BookableEntity>) {
	const [error, result] = await resolve<
		ApiResponse<{ bookable: BookableEntity }>
	>(() =>
		apiFetch({
			path: 'bookables',
			method: 'POST',
			data,
		})
	);

	if (error) return { error };
	return { data: result?.data?.bookable };
}
