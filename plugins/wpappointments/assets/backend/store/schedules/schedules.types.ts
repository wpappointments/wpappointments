import type {
	DayOpeningHours,
	OpeningHoursSlot,
} from '../settings/settings.types';

export type OverrideGroup = {
	id: string;
	dates: string[];
	type: 'custom' | 'closed';
	slots: OpeningHoursSlot[];
};

export type Schedule = {
	id: number;
	name: string;
	timezone: string;
	isDefault: boolean;
	days: Record<string, DayOpeningHours>;
	overrides: OverrideGroup[];
};

export type SchedulesState = {
	schedules: Schedule[];
	loaded: boolean;
};
