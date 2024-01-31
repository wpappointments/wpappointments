import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/utils/fetch';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { AvailabilityState } from './availability.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_AVAILABILITY_STATE: AvailabilityState = {
	today: [],
};

export const actions = {
	setAvailability(availability: AvailabilityState['today']) {
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
				draft.today = action.availability;
			});

		default:
			return state;
	}
};

export const selectors = {
	getAvailability(state: State) {
		return state.availability;
	},
};

export const controls = {
	SET_AVAILABILITY() {
		return apiFetch({ path: 'availability' });
	},
};

export const resolvers = {
	*getAvailability(): Generator<
		FetchFromApiActionReturn,
		{ type: string; availability: State['availability']['today'] },
		APIResponse<{ availability: State['availability']['today'] }>
	> {
		const response = yield baseActions.fetchFromAPI('availability');
		const { data } = response;
		const { availability } = data;
		return actions.setAvailability(availability);
	},
};
