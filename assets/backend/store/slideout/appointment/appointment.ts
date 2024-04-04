import { produce } from 'immer';
import { type State } from '~/backend/store/store';
import { Customer } from '~/backend/types';
import { MonthIndex, AppointmentSlideoutState, Year } from './appointment.types';


type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_SLIDEOUT_STATE: AppointmentSlideoutState = {
	currentMonth: 0,
	currentYear: 2024,
	selectedCustomer: null,
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
	setSelectedCustomer(customer: Customer | null) {
		return {
			type: 'SET_SELECTED_CUSTOMER',
			customer,
		} as const;
	},
	clearSelectedCustomer() {
		return {
			type: 'SET_SELECTED_CUSTOMER',
			customer: null,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SLIDEOUT_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_CURRENT_MONTH':
			return produce(state, (draft) => {
				draft.currentMonth = action.month;
			});

		case 'SET_CURRENT_YEAR':
			return produce(state, (draft) => {
				draft.currentYear = action.year;
			});

		case 'SET_SELECTED_CUSTOMER':
			return produce(state, (draft) => {
				draft.selectedCustomer = action.customer;
			});

		default:
			return state;
	}
};

export const selectors = {
	getCurrentMonth(state: State) {
		return state.appointmentSlideout.currentMonth;
	},
	getCurrentYear(state: State) {
		return state.appointmentSlideout.currentYear;
	},
	getSelectedCustomer(state: State) {
		return state.appointmentSlideout.selectedCustomer;
	},
};

export const controls = {};

export const resolvers = {};
