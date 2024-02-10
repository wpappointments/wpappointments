import { produce } from 'immer';
import { type State } from '../../store';
import {
	MonthIndex,
	AppointmentSlideoutState,
	Year,
} from './appointment.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_SLIDEOUT_STATE: AppointmentSlideoutState = {
	curentMonth: 1,
	currentYear: 2024,
};

export const actions = {
	setCurrentMonth(month: MonthIndex) {
		return {
			type: 'SET_CURRENT_MONTH',
			month,
		} as const;
	},
	setCurrentYear(year: Year) {
		return {
			type: 'SET_CURRENT_YEAR',
			year,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SLIDEOUT_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_CURRENT_MONTH':
			return produce(state, (draft) => {
				draft.curentMonth = action.month;
			});

		case 'SET_CURRENT_YEAR':
			return produce(state, (draft) => {
				draft.currentYear = action.year;
			});

		default:
			return state;
	}
};

export const selectors = {
	getCurrentMonth(state: State) {
		return state.appointmentSlideout.curentMonth;
	},
	getCurrentYear(state: State) {
		return state.appointmentSlideout.currentYear;
	},
};

export const controls = {};

export const resolvers = {};
