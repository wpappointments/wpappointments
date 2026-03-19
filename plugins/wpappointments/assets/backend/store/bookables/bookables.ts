import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { BookableEntity, BookableType } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type BookablesState } from './bookables.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, unknown>;
type Response = APIResponse<BookablesState>;
type TypesResponse = APIResponse<{ types: BookableType[] }>;

export const DEFAULT_BOOKABLES_STATE: BookablesState = {
	bookables: [],
	types: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setBookables({
		bookables,
		totalItems,
		totalPages,
		postsPerPage,
		currentPage,
	}: Omit<BookablesState, 'types'>) {
		return {
			type: 'SET_BOOKABLES',
			bookables,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage,
		} as const;
	},
	createBookable(bookable: BookableEntity) {
		return {
			type: 'CREATE_BOOKABLE',
			bookable,
		} as const;
	},
	updateBookable(bookable: BookableEntity) {
		return {
			type: 'UPDATE_BOOKABLE',
			bookable,
		} as const;
	},
	deleteBookable(id: number) {
		return {
			type: 'DELETE_BOOKABLE',
			id,
		} as const;
	},
	setBookableTypes(types: BookableType[]) {
		return {
			type: 'SET_BOOKABLE_TYPES',
			types,
		} as const;
	},
};

export const reducer = (state = DEFAULT_BOOKABLES_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_BOOKABLES':
			return produce(state, (draft) => {
				draft.bookables = action.bookables;
				draft.totalItems = action.totalItems;
				draft.totalPages = action.totalPages;
				draft.postsPerPage = action.postsPerPage;
				draft.currentPage = action.currentPage;
			});

		case 'CREATE_BOOKABLE':
			return produce(state, (draft) => {
				draft.bookables.unshift(action.bookable);
			});

		case 'UPDATE_BOOKABLE':
			return produce(state, (draft) => {
				draft.bookables = draft.bookables.map((b: BookableEntity) =>
					b.id === action.bookable.id ? action.bookable : b
				);
			});

		case 'DELETE_BOOKABLE':
			return produce(state, (draft) => {
				draft.bookables = draft.bookables.filter(
					(b: BookableEntity) => b.id !== action.id
				);
			});

		case 'SET_BOOKABLE_TYPES':
			return produce(state, (draft) => {
				draft.types = action.types;
			});

		default:
			return state;
	}
};

export const selectors = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBookables(state: State, _?: Query) {
		return state.bookables;
	},
	getBookableTypes(state: State) {
		return state.bookables.types;
	},
};

export const controls = {
	SET_BOOKABLES() {
		return apiFetch({ path: 'bookables' });
	},
};

export const resolvers = {
	*getBookables(query: Query): Generator<
		FetchFromApiActionReturn,
		{
			type: string;
			bookables: BookableEntity[];
		},
		Response
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('bookables', {
				query,
			})
		);
		const { data } = response;

		return actions.setBookables(data);
	},
	*getBookableTypes(): Generator<
		FetchFromApiActionReturn,
		{ type: string; types: BookableType[] },
		TypesResponse
	> {
		const response = yield baseActions.fetchFromAPI('bookable-types');
		const { data } = response;
		return actions.setBookableTypes(data.types);
	},
};
