import { produce } from 'immer';
import type { Day, DayOpeningHours, SettingsState } from './settings.types';
import { type State } from '../store';
import apiFetch, { APIResponse } from '~/utils/fetch';
import { baseActions, FetchFromApiActionReturn } from '../actions';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

function getDefaultOpeningHours(day: Day) {
	return {
		day,
		enabled: false,
		slots: {
			list: [
				{
					start: {
						hour: '10',
						minute: '00',
					},
					end: {
						hour: '18',
						minute: '00',
					},
				},
			],
		},
	};
}

export const DEFAULT_SETTINGS_STATE: SettingsState = {
	general: {
		firstName: '',
		lastName: '',
		phoneNumber: '',
		companyName: '',
	},
	schedule: {
		monday: getDefaultOpeningHours('monday'),
		tuesday: getDefaultOpeningHours('tuesday'),
		wednesday: getDefaultOpeningHours('wednesday'),
		thursday: getDefaultOpeningHours('thursday'),
		friday: getDefaultOpeningHours('friday'),
		saturday: getDefaultOpeningHours('saturday'),
		sunday: getDefaultOpeningHours('sunday'),
	},
};

export const actions = {
	setPluginSettings(settings: Partial<SettingsState>) {
		return {
			type: 'SET_PLUGIN_SETTINGS',
			settings,
		} as const;
	},
	updateWorkingHours(data: DayOpeningHours) {
		return {
			type: 'UPDATE_WORKING_HOURS',
			data,
		} as const;
	},
	addWorkingHoursSlot(day: keyof SettingsState['schedule']) {
		return {
			type: 'ADD_WORKING_HOURS_SLOT',
			day,
		} as const;
	},
	removeWorkingHoursSlot(
		day: keyof SettingsState['schedule'],
		index: number
	) {
		return {
			type: 'REMOVE_WORKING_HOURS_SLOT',
			day,
			index,
		} as const;
	},
	copyWorkingHoursToAllDays(data: DayOpeningHours) {
		return {
			type: 'COPY_WORKING_HOURS_TO_ALL_DAYS',
			data,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SETTINGS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_PLUGIN_SETTINGS':
			return produce(state, (draft) => {
				draft.general = {
					...draft.general,
					...action.settings.general,
				};
				draft.schedule = {
					...draft.schedule,
					...action.settings.schedule,
				};
			});

		case 'UPDATE_WORKING_HOURS':
			return produce(state, (draft) => {
				const day = action.data.day;

				draft.schedule[day] = {
					...draft.schedule[day],
					...action.data,
				};
			});

		case 'ADD_WORKING_HOURS_SLOT':
			return produce(state, (draft) => {
				const day = action.day;

				draft.schedule[day].slots.list.push({
					start: {
						hour: '10',
						minute: '00',
					},
					end: {
						hour: '18',
						minute: '00',
					},
				});
			});

		case 'REMOVE_WORKING_HOURS_SLOT':
			return produce(state, (draft) => {
				const day = action.day;
				const index = action.index;

				draft.schedule[day].slots.list.splice(index, 1);
			});

		case 'COPY_WORKING_HOURS_TO_ALL_DAYS':
			return produce(state, (draft) => {
				console.log(action.data);
				const createCopyFor = (day = action.data.day) => ({
					...draft.schedule[day],
					...{
						...action.data,
						day: day,
					},
				});

				draft.schedule = {
					...draft.schedule,
					tuesday: createCopyFor('tuesday'),
					wednesday: createCopyFor('wednesday'),
					thursday: createCopyFor('thursday'),
					friday: createCopyFor('friday'),
					saturday: createCopyFor('saturday'),
					sunday: createCopyFor('sunday'),
				};
			});

		default:
			return state;
	}
};

export const selectors = {
	getGeneralSettings(state: State) {
		return state.settings.general;
	},
	getScheduleSettings(state: State) {
		return state.settings.schedule;
	},
};

export const controls = {
	SET_PLUGIN_SETTINGS() {
		return apiFetch({ path: 'settings' });
	},
};

function* getSettings(): Generator<
	FetchFromApiActionReturn,
	{ type: string; settings: Partial<State['settings']> },
	APIResponse<{ settings: State['settings'] }>
> {
	const response = yield baseActions.fetchFromAPI('settings');
	const { data } = response;
	const { settings } = data;
	return actions.setPluginSettings(settings);
}

export const resolvers = {
	getGeneralSettings: getSettings,
	getScheduleSettings: getSettings,
};