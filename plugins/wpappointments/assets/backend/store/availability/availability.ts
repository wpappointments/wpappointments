import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { AvailabilityState } from './availability.types';

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

export const controls = {
	SET_AVAILABILITY() {
		return apiFetch({ path: 'availability' });
	},
};

export const resolvers = {
	*getAvailability(
		currentMonth: number,
		currentYear: number,
		timezone: string
	): Generator<
		FetchFromApiActionReturn,
		{ type: string; availability: State['availability'] },
		APIResponse<{ availability: State['availability'] }>
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('availability', {
				currentMonth: currentMonth + 1,
				currentYear,
				timezone,
			})
		);
		const { data } = response;
		const { availability } = data;
		return actions.setAvailability(availability);
	},
};
