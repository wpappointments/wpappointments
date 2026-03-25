import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type { Schedule } from '~/backend/store/schedules/schedules.types';
import type { DayOpeningHours } from '~/backend/store/settings/settings.types';

type ScheduleResponse = APIResponse<{
	schedule: Schedule;
}>;

type SchedulesResponse = APIResponse<{
	schedules: Schedule[];
}>;

export type CreateScheduleData = {
	name: string;
	timezone?: string;
	days?: Record<string, DayOpeningHours>;
};

export type UpdateScheduleData = {
	name?: string;
	timezone?: string;
	days?: Record<string, DayOpeningHours>;
};

export async function getSchedules() {
	const dispatch = window.wp.data.dispatch('wpappointments');

	const [error, response] = await resolve<SchedulesResponse>(async () => {
		return await apiFetch<SchedulesResponse>({ path: 'schedules' });
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setSchedules(response.data.schedules);
	}

	return response;
}

export async function createSchedule(data: CreateScheduleData) {
	const dispatch = window.wp.data.dispatch('wpappointments');

	const [error, response] = await resolve<ScheduleResponse>(async () => {
		return await apiFetch<ScheduleResponse>({
			path: 'schedules',
			method: 'POST',
			data,
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.addSchedule(response.data.schedule);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function updateSchedule(id: number, data: UpdateScheduleData) {
	const dispatch = window.wp.data.dispatch('wpappointments');

	const [error, response] = await resolve<ScheduleResponse>(async () => {
		return await apiFetch<ScheduleResponse>({
			path: `schedules/${id}`,
			method: 'PUT',
			data,
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.updateSchedule(response.data.schedule);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function deleteSchedule(id: number, reassign: boolean = true) {
	const dispatch = window.wp.data.dispatch('wpappointments');

	const [error, response] = await resolve<APIResponse<{ id: number }>>(
		async () => {
			return await apiFetch<APIResponse<{ id: number }>>({
				path: `schedules/${id}`,
				method: 'DELETE',
				data: { reassign },
			});
		}
	);

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.removeSchedule(response.data.id);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}

export async function setDefaultSchedule(id: number) {
	const dispatch = window.wp.data.dispatch('wpappointments');

	const [error, response] = await resolve<ScheduleResponse>(async () => {
		return await apiFetch<ScheduleResponse>({
			path: `schedules/${id}/set-default`,
			method: 'POST',
		});
	});

	if (error) {
		displayErrorToast(error.message);
		return null;
	}

	if (response) {
		dispatch.setScheduleAsDefault(id);
		displaySuccessToast(response.message ?? '');
	}

	return response;
}
