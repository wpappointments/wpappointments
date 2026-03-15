import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { Entity } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type EntitiesState } from './entities.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, any>;
type Response = APIResponse<EntitiesState>;

export const DEFAULT_ENTITIES_STATE: EntitiesState = {
	entities: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setEntities({
		entities,
		totalItems,
		totalPages,
		postsPerPage,
		currentPage,
	}: EntitiesState) {
		return {
			type: 'SET_ENTITIES',
			entities,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage,
		} as const;
	},
	createEntity(entity: Entity) {
		return {
			type: 'CREATE_ENTITY',
			entity,
		} as const;
	},
	updateEntity(entity: Entity) {
		return {
			type: 'UPDATE_ENTITY',
			entity,
		} as const;
	},
	deleteEntity(id: number) {
		return {
			type: 'DELETE_ENTITY',
			id,
		} as const;
	},
};

export const reducer = (state = DEFAULT_ENTITIES_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_ENTITIES':
			return produce(state, () => {
				return action;
			});

		case 'CREATE_ENTITY':
			return produce(state, (draft) => {
				draft.entities.unshift(action.entity);
			});

		case 'UPDATE_ENTITY':
			return produce(state, (draft) => {
				draft.entities = draft.entities.map((entity: Entity) =>
					entity.id === action.entity.id ? action.entity : entity
				);
			});

		case 'DELETE_ENTITY':
			return produce(state, (draft) => {
				draft.entities = draft.entities.filter(
					(entity: Entity) => entity.id !== action.id
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getEntities(state: State, _?: Query) {
		return state.entities;
	},
};

export const controls = {
	SET_ENTITIES() {
		return apiFetch({ path: 'entities' });
	},
};

export const resolvers = {
	*getEntities(query: Query): Generator<
		FetchFromApiActionReturn,
		{
			type: string;
			entities: Entity[];
		},
		Response
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('entities', {
				query,
			})
		);
		const { data } = response;

		return actions.setEntities(data);
	},
};
