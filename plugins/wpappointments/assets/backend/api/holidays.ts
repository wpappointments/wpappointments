import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type {
	HolidayGroup,
	HolidayGroupType,
} from '~/backend/store/holidays/holidays.types';

type GroupsResponse = APIResponse<{
	groups: HolidayGroup[];
}>;

export async function addHolidayGroup(type: HolidayGroupType, fileId: string) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<GroupsResponse>(async () => {
		return await apiFetch<GroupsResponse>({
			path: 'holidays/groups',
			method: 'POST',
			data: { type, file_id: fileId },
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setHolidayGroups(response.data.groups);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function removeHolidayGroup(groupId: string) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<GroupsResponse>(async () => {
		return await apiFetch<GroupsResponse>({
			path: `holidays/groups/${groupId}`,
			method: 'DELETE',
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setHolidayGroups(response.data.groups);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function toggleHolidayGroup(groupId: string, enabled: boolean) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<GroupsResponse>(async () => {
		return await apiFetch<GroupsResponse>({
			path: `holidays/groups/${groupId}`,
			method: 'PATCH',
			data: { enabled },
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setHolidayGroups(response.data.groups);
	}

	return response;
}

export async function toggleHoliday(
	groupId: string,
	holidayKey: string,
	enabled: boolean
) {
	const dispatch = window.wp.data.dispatch('appointments-booking');

	const [error, response] = await resolve<GroupsResponse>(async () => {
		return await apiFetch<GroupsResponse>({
			path: `holidays/groups/${groupId}`,
			method: 'PATCH',
			data: { holiday_key: holidayKey, holiday_enabled: enabled },
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setHolidayGroups(response.data.groups);
	}

	return response;
}
