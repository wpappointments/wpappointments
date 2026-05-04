import { produce } from 'immer';
import { type State } from '../store';
import { NoticesState, Toast } from './notices.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_TOAST_STATE: NoticesState = {
	toasts: [],
};

export const actions = {
	openToast(toast: Toast) {
		return {
			type: 'OPEN_TOAST',
			toast,
		} as const;
	},
	closeToast(toastId: string) {
		return {
			type: 'CLOSE_TOAST',
			toastId,
		} as const;
	},
};

export const reducer = (state = DEFAULT_TOAST_STATE, action: Action) => {
	switch (action.type) {
		case 'OPEN_TOAST':
			return produce(state, (draft) => {
				draft.toasts.push(action.toast);
			});

		case 'CLOSE_TOAST':
			return produce(state, (draft) => {
				draft.toasts = draft.toasts.filter(
					(toast) => toast.id !== action.toastId
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	getToasts(state: State) {
		return state.notices.toasts;
	},
};

export const controls = {};

export const resolvers = {};
