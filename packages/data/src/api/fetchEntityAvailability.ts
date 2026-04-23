import type { BookableVariant, AvailabilityData } from '../types';
import apiFetch from '../utils/apiFetch';
import resolve from '../utils/resolve';
import type { ApiResponse } from './types';

export async function fetchEntityAvailability(
	entityId: number,
	dateRange?: { startDate?: string; endDate?: string }
) {
	const queryParams = new URLSearchParams();

	if (dateRange?.startDate)
		queryParams.set('start_date', dateRange.startDate);
	if (dateRange?.endDate) queryParams.set('end_date', dateRange.endDate);

	const query = queryParams.toString();
	const path = `bookables/${entityId}/availability${query ? `?${query}` : ''}`;

	const [error, result] = await resolve<
		ApiResponse<{
			variants: Array<{
				variant: BookableVariant;
				availability: AvailabilityData;
			}>;
		}>
	>(() => apiFetch({ path }));

	if (error) return { error };
	return { data: result?.data?.variants };
}
