import { produce } from 'immer';
import { type State } from '../store';
import { SlideoutState, Slideout } from './slideout.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_SLIDEOUT_STATE: SlideoutState = {
	slideouts: [],
};

export const actions = {
	openSlideout(slideout: Slideout) {
		return {
			type: 'OPEN_SLIDEOUT',
			slideout,
		} as const;
	},
	closeSlideout(slideoutId: string) {
		return {
			type: 'CLOSE_SLIDEOUT',
			slideoutId,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SLIDEOUT_STATE, action: Action) => {
	switch (action.type) {
		case 'OPEN_SLIDEOUT':
			return produce(state, (draft) => {
				draft.slideouts.push(action.slideout);
			});

		case 'CLOSE_SLIDEOUT':
			return produce(state, (draft) => {
				draft.slideouts = draft.slideouts.filter(
					(slideout) => slideout.id !== action.slideoutId
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	getSlideouts(state: State) {
		return state.slideouts.slideouts;
	},
	getCurrentSlideout(state: State) {
		return state.slideouts.slideouts[state.slideouts.slideouts.length - 1];
	},
};

export const controls = {};

export const resolvers = {};
