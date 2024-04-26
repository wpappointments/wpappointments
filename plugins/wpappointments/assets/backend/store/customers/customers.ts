import { addQueryArgs } from '@wordpress/url';
import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { Customer } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type CustomersState } from './customers.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;
type Query = Record<string, any>;
type Response = APIResponse<CustomersState>;

export const DEFAULT_CUSTOMERS_STATE: CustomersState = {
	customers: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setCustomers({
		customers,
		totalItems,
		totalPages,
		postsPerPage,
		currentPage,
	}: CustomersState) {
		return {
			type: 'SET_CUSTOMERS',
			customers,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage,
		} as const;
	},
	createCustomer(customer: Customer) {
		return {
			type: 'CREATE_CUSTOMER',
			customer,
		} as const;
	},
	updateCustomer(customer: Customer) {
		return {
			type: 'UPDATE_CUSTOMER',
			customer,
		} as const;
	},
	deleteCustomer(id: number) {
		return {
			type: 'DELETE_CUSTOMER',
			id,
		} as const;
	},
};

export const reducer = (state = DEFAULT_CUSTOMERS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_CUSTOMERS':
			return produce(state, () => {
				return action;
			});

		case 'CREATE_CUSTOMER':
			return produce(state, (draft) => {
				draft.customers.unshift(action.customer);
			});

		case 'UPDATE_CUSTOMER':
			return produce(state, (draft) => {
				draft.customers = draft.customers.map((customer: Customer) =>
					customer.id === action.customer.id
						? action.customer
						: customer
				);
			});

		case 'DELETE_CUSTOMER':
			return produce(state, (draft) => {
				draft.customers = draft.customers.filter(
					(customer: Customer) => customer.id !== action.id
				);
			});

		default:
			return state;
	}
};

export const selectors = {
	getCustomers(state: State, _?: Query) {
		return state.customers;
	},
};

export const controls = {
	SET_CUSTOMERS() {
		return apiFetch({ path: 'customers' });
	},
};

export const resolvers = {
	*getCustomers(query: Query): Generator<
		FetchFromApiActionReturn,
		{
			type: string;
			customers: Customer[];
		},
		Response
	> {
		const response = yield baseActions.fetchFromAPI(
			addQueryArgs('customers', {
				query,
			})
		);
		const { data } = response;

		return actions.setCustomers(data);
	},
};
