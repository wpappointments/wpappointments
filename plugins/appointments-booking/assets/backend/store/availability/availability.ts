import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import { APIResponse } from '~/backend/utils/fetch';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { AvailabilityState } from './availability.types';
import { DayCalendar } from '~/frontend/frontend';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_AVAILABILITY_STATE: AvailabilityState = {
	month: [],
};

export const actions = {
	setAvailability(availability: AvailabilityState) {
		return {
			type: 'SET_AVAILABILITY',
			availability,
		} as const;
	},
};

export const reducer = (state = DEFAULT_AVAILABILITY_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_AVAILABILITY':
			return produce(state, (draft) => {
				draft.month = action.availability.month;
			});

		default:
			return state;
	}
};

export const selectors = {
	getAvailability(
		state: State,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		entityId: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		currentMonth: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		currentYear: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		timezone: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: number
	) {
		return state.availability;
	},
};

export const controls = {};

export const resolvers = {
	*getAvailability(
		entityId: number,
		currentMonth: number,
		currentYear: number,
		timezone: string
	): Generator<
		FetchFromApiActionReturn,
		{ type: string; availability: State['availability'] },
		APIResponse<{ availability: DayCalendar[][] }>
	> {
		if (!entityId) {
			return actions.setAvailability({ month: [] });
		}

		const daysInMonth = new Date(
			currentYear,
			currentMonth + 1,
			0
		).getDate();
		const dates: string[] = [];

		for (let i = 1; i <= daysInMonth; i++) {
			const m = String(currentMonth + 1).padStart(2, '0');
			const day = String(i).padStart(2, '0');
			dates.push(`${currentYear}-${m}-${day}`);
		}

		const response = yield baseActions.fetchFromAPI(
			addQueryArgs(`bookables/${entityId}/calendar-slots`, {
				calendar: JSON.stringify([dates]),
				timezone,
			})
		);
		const { data } = response;
		const month = data.availability.flat();
		return actions.setAvailability({ month });
	},
};
