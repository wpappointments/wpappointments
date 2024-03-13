import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { Customer } from '~/backend/types';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type CustomersState } from './customers.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

type Response = APIResponse<{
	customers: Customer[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
}>;

export const DEFAULT_CUSTOMERS_STATE: CustomersState = {
	customers: [],
	totalItems: 0,
	totalPages: 1,
	postsPerPage: 10,
	currentPage: 1,
};

export const actions = {
	setCustomers(
		customers: Customer[],
		totalItems: number,
		totalPages: number,
		postsPerPage: number,
		currentPage: number
	) {
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
};

export const reducer = (state = DEFAULT_CUSTOMERS_STATE, action: Action) => {
	switch (action.type) {
		case 'SET_CUSTOMERS':
			return produce(state, (draft) => {
				draft.customers = action.customers;
				draft.totalItems = action.totalItems;
				draft.totalPages = action.totalPages;
				draft.postsPerPage = action.postsPerPage;
				draft.currentPage = action.currentPage;
			});

		case 'CREATE_CUSTOMER':
			return produce(state, (draft) => {
				draft.customers.push(action.customer);
			});

		default:
			return state;
	}
};

export const selectors = {
	getCustomers(state: State) {
		return {
			customers: state.customers.customers,
			totalItems: state.customers.totalItems,
			totalPages: state.customers.totalPages,
			postsPerPage: state.customers.postsPerPage,
			currentPage: state.customers.currentPage,
		};
	},
};

export const controls = {
	SET_CUSTOMERS() {
		return apiFetch({ path: 'customer' });
	},
};

export const resolvers = {
	*getCustomers(): Generator<
		FetchFromApiActionReturn,
		{
			type: string;
			customers: Customer[];
		},
		Response
	> {
		const response = yield baseActions.fetchFromAPI('customer');
		const { data } = response;
		const { customers, totalItems, totalPages, postsPerPage, currentPage } =
			data;

		return actions.setCustomers(
			customers,
			totalItems,
			totalPages,
			postsPerPage,
			currentPage
		);
	},
};
