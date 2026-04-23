import type { BookableEntity } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
