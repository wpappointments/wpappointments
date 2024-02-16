import { produce } from 'immer';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { FetchFromApiActionReturn, baseActions } from '../actions';
import { type State } from '../store';
import { type CustomersState } from './customers.types';

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

export const DEFAULT_CUSTOMERS_STATE: CustomersState = {
	allCustomers: [],
};

export const actions = {
	setAllCustomers(customers: State['customers']['allCustomers']) {
		return {
			type: 'SET_CUSTOMERS',
			customers,
		} as const;
	},
	createCustomer(customer: State['customers']['allCustomers'][0]) {
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
				draft.allCustomers = action.customers;
			});

		case 'CREATE_CUSTOMER':
			return produce(state, (draft) => {
				draft.allCustomers.push(action.customer);
			});

		default:
			return state;
	}
};

export const selectors = {
	getAllCustomers(state: State) {
		return state.customers.allCustomers;
	},
};

export const controls = {
	SET_CUSTOMERS() {
		return apiFetch({ path: 'customer' });
	},
};

export const resolvers = {
	*getAllCustomers(): Generator<
		FetchFromApiActionReturn,
		{ type: string; customers: State['customers']['allCustomers'] },
		APIResponse<{ customers: State['customers']['allCustomers'] }>
	> {
		const response = yield baseActions.fetchFromAPI('customer');
		const { data } = response;
		const { customers } = data;
		return actions.setAllCustomers(customers);
	},
};
