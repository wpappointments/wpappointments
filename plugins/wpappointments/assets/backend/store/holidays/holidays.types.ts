export type HolidayGroupType = 'country' | 'religious';

export type HolidayDetail = {
	ref: string;
	name: string;
	type: string;
	enabled: boolean;
	dates: Record<number, string | null>;
};

export type HolidayGroup = {
	id: string;
	type: HolidayGroupType;
	source: string;
	label: string;
	enabled: boolean;
	excluded: string[];
	holidays: HolidayDetail[];
};

export type AvailableSet = {
	id: string;
	name: string;
};

export type HolidaysState = {
	groups: HolidayGroup[];
	groupsLoaded: boolean;
	availableCountries: AvailableSet[];
	availableReligious: AvailableSet[];
	availableLoaded: boolean;
};
