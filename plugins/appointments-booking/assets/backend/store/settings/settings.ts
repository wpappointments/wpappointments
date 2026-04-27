import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { type State } from '../store';
import type { SettingsState } from './settings.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_SETTINGS_STATE: SettingsState = {
	general: {
		firstName: '',
		lastName: '',
		phoneNumber: '',
		companyName: '',
		clockType: '24',
	},
	appointments: {
		defaultLength: undefined,
		timePickerPrecision: undefined,
		defaultStatus: 'confirmed',
	},
	calendar: {},
	notifications: {},
};

export const actions = {
	setPluginSettings(settings: Partial<SettingsState>) {
		return {
			type: 'SET_PLUGIN_SETTINGS',
			settings,
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
				draft.appointments = {
					...draft.appointments,
					...action.settings.appointments,
				};
				draft.notifications = {
					...draft.notifications,
					...action.settings.notifications,
				};
			});

		default:
			return state;
	}
};

export const selectors = {
	getAllSettings(state: State) {
		return state.settings;
	},
	getGeneralSettings(state: State) {
		return state.settings.general;
	},
	getAppointmentsSettings(state: State) {
		return state.settings.appointments;
	},
	getNotificationsSettings(state: State) {
		return state.settings.notifications;
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
	getAllSettings: getSettings,
	getGeneralSettings: getSettings,
	getAppointmentsSettings: getSettings,
	getNotificationsSettings: getSettings,
};
