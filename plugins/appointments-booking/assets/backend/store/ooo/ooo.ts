import { produce } from 'immer';
import { APIResponse } from '~/backend/utils/fetch';
import { baseActions, FetchFromApiActionReturn } from '../actions';
import { type State } from '../store';
import type { OooEntry, OooState } from './ooo.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_OOO_STATE: OooState = {
	entries: [],
	loaded: false,
};

export const actions = {
	setOooEntries(entries: OooEntry[]) {
		return {
			type: 'SET_OOO_ENTRIES',
			entries,
		} as const;
	},
	addOooEntry(entry: OooEntry) {
		return {
			type: 'ADD_OOO_ENTRY',
			entry,
		} as const;
	},
	updateOooEntry(entry: OooEntry) {
		return {
			type: 'UPDATE_OOO_ENTRY',
			entry,
		} as const;
	},
	removeOooEntry(id: number) {
		return {
			type: 'REMOVE_OOO_ENTRY',
			id,
		} as const;
	},
};

export const reducer = (state = DEFAULT_OOO_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_OOO_ENTRIES':
			return produce(state, (draft) => {
				draft.entries = action.entries;
				draft.loaded = true;
			});

		case 'ADD_OOO_ENTRY':
			return produce(state, (draft) => {
				draft.entries.push(action.entry);
			});

		case 'UPDATE_OOO_ENTRY':
			return produce(state, (draft) => {
				const index = draft.entries.findIndex(
					(e) => e.id === action.entry.id
				);
				if (index !== -1) {
					draft.entries[index] = action.entry;
				}
			});

		case 'REMOVE_OOO_ENTRY':
			return produce(state, (draft) => {
				draft.entries = draft.entries.filter((e) => e.id !== action.id);
			});

		default:
			return state;
	}
};

export const selectors = {
	getOooEntries(state: State) {
		return state.ooo.entries;
	},
	getOooLoaded(state: State) {
		return state.ooo.loaded;
	},
	getOooEntryById(state: State, id: number) {
		return state.ooo.entries.find((e) => e.id === id);
	},
};

export const controls = {};

type OooResponse = APIResponse<{
	entries: OooEntry[];
}>;

function* getOooEntries(): Generator<
	FetchFromApiActionReturn,
	{ type: string; entries: OooEntry[] },
	OooResponse
> {
	const response = yield baseActions.fetchFromAPI('ooo');
	const { data } = response;
	return actions.setOooEntries(data.entries);
}

export const resolvers = {
	getOooEntries,
	getOooLoaded: getOooEntries,
};
