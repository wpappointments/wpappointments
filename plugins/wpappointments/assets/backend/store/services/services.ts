import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { Service } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type ServicesState } from './services.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, any>;
type Response = APIResponse<ServicesState>;

export const DEFAULT_SERVICES_STATE: ServicesState = {
	services: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setServices({
		services,
		totalItems,
		totalPages,
		postsPerPage,
		currentPage,
	}: ServicesState) {
		return {
			type: 'SET_SERVICES',
			services,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage,
		} as const;
	},
	createService(service: Service) {
		return {
			type: 'CREATE_SERVICE',
			service,
		} as const;
	},
	updateService(service: Service) {
		return {
			type: 'UPDATE_SERVICE',
			service,
		} as const;
	},
	deleteService(id: number) {
		return {
			type: 'DELETE_SERVICE',
			id,
		} as const;
	},
};

export const reducer = (state = DEFAULT_SERVICES_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_SERVICES':
			return produce(state, () => {
				return action;
			});

		case 'CREATE_SERVICE':
			return produce(state, (draft) => {
				draft.services.unshift(action.service);
			});

		case 'UPDATE_SERVICE':
			return produce(state, (draft) => {
				draft.services = draft.services.map((service: Service) =>
					service.id === action.service.id ? action.service : service
				);
			});

		case 'DELETE_SERVICE':
			return produce(state, (draft) => {
				draft.services = draft.services.filter(
					(service: Service) => service.id !== action.id
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getServices(state: State, _?: Query) {
		return state.services;
	},
};

export const controls = {
	SET_SERVICES() {
		return apiFetch({ path: 'services' });
	},
};

export const resolvers = {
	*getServices(query: Query): Generator<
		FetchFromApiActionReturn,
		{
			type: string;
			services: Service[];
		},
		Response
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('services', {
				query,
			})
		);
		const { data } = response;

		return actions.setServices(data);
	},
};
