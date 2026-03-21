/**
 * Court booking API client
 *
 * Wraps @wordpress/api-fetch for court-specific REST calls.
 * Validates that the core bookable REST endpoints work for plugin-registered types.
 */
import apiFetch from '@wordpress/api-fetch';

const NAMESPACE = 'wpappointments/v1';

export type Court = {
	id: number;
	name: string;
	active: boolean;
	description: string;
	type: string;
	duration: number;
	attributes: Array<{ name: string; values: string[] }>;
	meta: Record<string, unknown>;
	surfaceType?: string;
	indoor?: boolean;
	lighting?: boolean;
	maxPlayers?: number;
};

export type CourtVariant = {
	id: number;
	parentId: number;
	name: string;
	active: boolean;
	attributeValues: Record<string, string>;
	overrides: string[];
	duration: number;
	meta: Record<string, unknown>;
};

type ApiResponse<T> = {
	status: string;
	message: string;
	data: T;
};

export async function fetchCourts(): Promise<Court[]> {
	const response = await apiFetch<
		ApiResponse<{
			bookables: Court[];
			totalItems: number;
		}>
	>({
		path: `/${NAMESPACE}/bookables?type=court`,
	});

	return response.data?.bookables || [];
}

export async function createCourt(
	data: Partial<Court>
): Promise<ApiResponse<{ bookable: Court }>> {
	return apiFetch({
		path: `/${NAMESPACE}/bookables`,
		method: 'POST',
		data: { ...data, type: 'court' },
	});
}

export async function updateCourt(
	id: number,
	data: Partial<Court>
): Promise<ApiResponse<{ bookable: Court }>> {
	return apiFetch({
		path: `/${NAMESPACE}/bookables/${id}`,
		method: 'PUT',
		data,
	});
}

export async function deleteCourt(
	id: number
): Promise<ApiResponse<{ id: number }>> {
	return apiFetch({
		path: `/${NAMESPACE}/bookables/${id}`,
		method: 'DELETE',
	});
}

export async function fetchVariants(entityId: number): Promise<CourtVariant[]> {
	const response = await apiFetch<ApiResponse<{ variants: CourtVariant[] }>>({
		path: `/${NAMESPACE}/bookables/${entityId}/variants`,
	});

	return response.data?.variants || [];
}
