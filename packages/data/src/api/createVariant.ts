import type { BookableVariant } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
