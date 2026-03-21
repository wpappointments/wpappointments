import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
