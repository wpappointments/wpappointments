import type { AvailabilityData } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

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
