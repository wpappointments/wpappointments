import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { ServiceCategory } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type ServiceCategoriesState } from './service-categories.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Response = APIResponse<{ categories: ServiceCategory[] }>;

export const DEFAULT_SERVICE_CATEGORIES_STATE: ServiceCategoriesState = {
	categories: [],
};

export const actions = {
	setServiceCategories(categories: ServiceCategory[]) {
		return {
			type: 'SET_SERVICE_CATEGORIES',
			categories,
		} as const;
	},
	createServiceCategory(category: ServiceCategory) {
		return {
			type: 'CREATE_SERVICE_CATEGORY',
			category,
		} as const;
	},
	updateServiceCategory(category: ServiceCategory) {
		return {
			type: 'UPDATE_SERVICE_CATEGORY',
			category,
		} as const;
	},
	deleteServiceCategory(id: number) {
		return {
			type: 'DELETE_SERVICE_CATEGORY',
			id,
		} as const;
	},
};

export const reducer = (
	state = DEFAULT_SERVICE_CATEGORIES_STATE,
	action: Action
) => {
	switch (action.type) {
		case 'SET_SERVICE_CATEGORIES':
			return produce(state, (draft) => {
				draft.categories = action.categories;
			});

		case 'CREATE_SERVICE_CATEGORY':
			return produce(state, (draft) => {
				draft.categories.push(action.category);
			});

		case 'UPDATE_SERVICE_CATEGORY':
			return produce(state, (draft) => {
				draft.categories = draft.categories.map((cat) =>
					cat.id === action.category.id ? action.category : cat
				);
			});

		case 'DELETE_SERVICE_CATEGORY':
			return produce(state, (draft) => {
				draft.categories = draft.categories.filter(
					(cat) => cat.id !== action.id
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getServiceCategories(state: State, _?: unknown) {
		return state.serviceCategories.categories;
	},
};

export const controls = {
	SET_SERVICE_CATEGORIES() {
		return apiFetch({ path: 'service-categories' });
	},
};

export const resolvers = {
	*getServiceCategories(): Generator<
		FetchFromApiActionReturn,
		{ type: string; categories: ServiceCategory[] },
		Response
	> {
		const response = yield baseActions.fetchFromAPI('service-categories');
		const { data } = response;
		return actions.setServiceCategories(data.categories);
	},
};
