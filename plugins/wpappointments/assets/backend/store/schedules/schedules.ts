import { produce } from 'immer';
import { APIResponse } from '~/backend/utils/fetch';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { type State } from '../store';
import type { Schedule, SchedulesState } from './schedules.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_SCHEDULES_STATE: SchedulesState = {
	schedules: [],
	loaded: false,
};

export const actions = {
	setSchedules(schedules: Schedule[]) {
		return {
			type: 'SET_SCHEDULES',
			schedules,
		} as const;
	},
	addSchedule(schedule: Schedule) {
		return {
			type: 'ADD_SCHEDULE',
			schedule,
		} as const;
	},
	updateSchedule(schedule: Schedule) {
		return {
			type: 'UPDATE_SCHEDULE',
			schedule,
		} as const;
	},
	removeSchedule(id: number) {
		return {
			type: 'REMOVE_SCHEDULE',
			id,
		} as const;
	},
	setScheduleAsDefault(id: number) {
		return {
			type: 'SET_SCHEDULE_AS_DEFAULT',
			id,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SCHEDULES_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_SCHEDULES':
			return produce(state, (draft) => {
				draft.schedules = action.schedules;
				draft.loaded = true;
			});

		case 'ADD_SCHEDULE':
			return produce(state, (draft) => {
				draft.schedules.push(action.schedule);
			});

		case 'UPDATE_SCHEDULE':
			return produce(state, (draft) => {
				const index = draft.schedules.findIndex(
					(s) => s.id === action.schedule.id
				);
				if (index !== -1) {
					draft.schedules[index] = action.schedule;
				}
			});

		case 'REMOVE_SCHEDULE':
			return produce(state, (draft) => {
				draft.schedules = draft.schedules.filter(
					(s) => s.id !== action.id
				);
			});

		case 'SET_SCHEDULE_AS_DEFAULT':
			return produce(state, (draft) => {
				for (const schedule of draft.schedules) {
					schedule.isDefault = schedule.id === action.id;
				}
			});

		default:
			return state;
	}
};

export const selectors = {
	getSchedules(state: State) {
		return state.schedules.schedules;
	},
	getSchedulesLoaded(state: State) {
		return state.schedules.loaded;
	},
	getScheduleById(state: State, id: number) {
		return state.schedules.schedules.find((s) => s.id === id);
	},
	getDefaultSchedule(state: State) {
		return state.schedules.schedules.find((s) => s.isDefault);
	},
};

export const controls = {};

type SchedulesResponse = APIResponse<{
	schedules: Schedule[];
}>;

function* getSchedules(): Generator<
	FetchFromApiActionReturn,
	{ type: string; schedules: Schedule[] },
	SchedulesResponse
> {
	const response = yield baseActions.fetchFromAPI('schedules');
	const { data } = response;
	return actions.setSchedules(data.schedules);
}

export const resolvers = {
	getSchedules,
	getSchedulesLoaded: getSchedules,
};
