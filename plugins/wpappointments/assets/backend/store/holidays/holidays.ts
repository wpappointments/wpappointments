import { produce } from 'immer';
import { APIResponse } from '~/backend/utils/fetch';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { type State } from '../store';
import type {
	AvailableSet,
	HolidayGroup,
	HolidaysState,
} from './holidays.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_HOLIDAYS_STATE: HolidaysState = {
	groups: [],
	groupsLoaded: false,
	availableCountries: [],
	availableReligious: [],
	availableLoaded: false,
};

export const actions = {
	setHolidayGroups(groups: HolidayGroup[]) {
		return {
			type: 'SET_HOLIDAY_GROUPS',
			groups,
		} as const;
	},
	setAvailableHolidaySets(
		countries: AvailableSet[],
		religious: AvailableSet[]
	) {
		return {
			type: 'SET_AVAILABLE_HOLIDAY_SETS',
			countries,
			religious,
		} as const;
	},
};

export const reducer = (state = DEFAULT_HOLIDAYS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_HOLIDAY_GROUPS':
			return produce(state, (draft) => {
				draft.groups = action.groups;
				draft.groupsLoaded = true;
			});

		case 'SET_AVAILABLE_HOLIDAY_SETS':
			return produce(state, (draft) => {
				draft.availableCountries = action.countries;
				draft.availableReligious = action.religious;
				draft.availableLoaded = true;
			});

		default:
			return state;
	}
};

export const selectors = {
	getHolidayGroups(state: State) {
		return state.holidays.groups;
	},
	getHolidayGroupsLoaded(state: State) {
		return state.holidays.groupsLoaded;
	},
	getAvailableCountries(state: State) {
		return state.holidays.availableCountries;
	},
	getAvailableReligious(state: State) {
		return state.holidays.availableReligious;
	},
	getAvailableLoaded(state: State) {
		return state.holidays.availableLoaded;
	},
};

export const controls = {};

type GroupsResponse = APIResponse<{
	groups: HolidayGroup[];
}>;

type AvailableResponse = APIResponse<{
	countries: AvailableSet[];
	religious: AvailableSet[];
}>;

function* getHolidayGroups(): Generator<
	FetchFromApiActionReturn,
	{ type: string; groups: HolidayGroup[] },
	GroupsResponse
> {
	const response = yield baseActions.fetchFromAPI('holidays/groups');
	const { data } = response;
	return actions.setHolidayGroups(data.groups);
}

function* getAvailableCountries(): Generator<
	FetchFromApiActionReturn,
	{
		type: string;
		countries: AvailableSet[];
		religious: AvailableSet[];
	},
	AvailableResponse
> {
	const response = yield baseActions.fetchFromAPI('holidays/available');
	const { data } = response;
	return actions.setAvailableHolidaySets(data.countries, data.religious);
}

export const resolvers = {
	getHolidayGroups,
	getHolidayGroupsLoaded: getHolidayGroups,
	getAvailableCountries,
	getAvailableReligious: getAvailableCountries,
};
