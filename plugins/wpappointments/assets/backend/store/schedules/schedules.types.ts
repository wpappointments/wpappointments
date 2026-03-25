import type { DayOpeningHours } from '../settings/settings.types';

export type Schedule = {
	id: number;
	name: string;
	timezone: string;
	isDefault: boolean;
	days: Record<string, DayOpeningHours>;
};

export type SchedulesState = {
	schedules: Schedule[];
	loaded: boolean;
};
