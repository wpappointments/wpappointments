import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type { OooEntry, OooReason } from '~/backend/store/ooo/ooo.types';

type OooResponse = APIResponse<{
	entry: OooEntry;
}>;

export type CreateOooData = {
	start_date: string;
	end_date: string;
	reason?: OooReason;
	notes?: string;
	note_public?: boolean;
};

export type UpdateOooData = Partial<CreateOooData>;

export async function createOooEntry(data: CreateOooData) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<OooResponse>(async () => {
		return await apiFetch<OooResponse>({
			path: 'ooo',
			method: 'POST',
			data,
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.addOooEntry(response.data.entry);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function updateOooEntry(id: number, data: UpdateOooData) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<OooResponse>(async () => {
		return await apiFetch<OooResponse>({
			path: `ooo/${id}`,
			method: 'PUT',
			data,
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.updateOooEntry(response.data.entry);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function deleteOooEntry(id: number) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<APIResponse<{ id: number }>>(
		async () => {
			return await apiFetch<APIResponse<{ id: number }>>({
				path: `ooo/${id}`,
				method: 'DELETE',
			});
		}
	);

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.removeOooEntry(response.data.id);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}
