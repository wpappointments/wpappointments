import type { BookableVariant } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
