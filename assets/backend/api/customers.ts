import { __ } from '@wordpress/i18n';
import { missingId } from '~/backend/utils/api';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import { Customer } from '~/backend/types';


type CustomerData = Pick<Customer, 'id' | 'name' | 'email' | 'phone'>;

type Response = APIResponse<{
	customer: CustomerData & { id: number };
	message: string;
}>;

export type CustomersApiOptions = {
	invalidateCache?: (selector: string) => void;
};

export function customersApi(options?: CustomersApiOptions) {
	const { invalidateCache } = options || {};
	const dispatch = window.wp.data.dispatch('wpappointments');
	const select = window.wp.data.select('wpappointments');

	async function getCustomers() {
		return select.getCustomers();
	}

	async function createCustomer(data: CustomerData) {
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'customer',
				method: 'POST',
				data,
			});

			return response;
		});

		if (error) {
			handleError(error, 'Error creating customer');
		}

		if (response && response.type === 'error') {
			const error: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};

			handleError(error, 'Error creating customer');
		}

		if (response && response.type === 'success') {
			const { data: responseData } = response;
			const { customer } = responseData;

			dispatch.createCustomer(customer);

			displaySuccessToast(
				__('Customer created successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getCustomers');
			}
		}

		return response;
	}

	async function updateCustomer(data: CustomerData) {
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `customer/${data.id}`,
				method: 'POST',
				data,
			});

			return response;
		});

		if (error) {
			handleError(error, 'Error updating customer');
		}

		if (response && response.type === 'error') {
			const error: Error = {
				type: 'error',
				message: response?.data?.message || 'Unknown error',
				data: [],
			};

			handleError(error, 'Error updating customer');
		}

		if (response && response.type === 'success') {
			const { data: responseData } = response;
			const { customer } = responseData;

			dispatch.updateCustomer(customer);

			displaySuccessToast(
				__('Customer updated successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getCustomers');
			}
		}

		return response;
	}

	async function deleteCustomer(id: number) {
		if (missingId(id, 'Cannot delete customer')) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: `customer/${id}`,
				method: 'DELETE',
			});

			dispatch.deleteCustomer(id);

			return response;
		});

		if (error) {
			handleError(error, __('Cannot delete customer', 'wpappointments'));
			return;
		}

		if (response) {
			displaySuccessToast(
				__('Customer deleted successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getCustomers');
			}
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);

		console.error('Error: ' + getErrorMessage(error));
	}

	const functions = {
		getCustomers,
		createCustomer,
		updateCustomer,
		deleteCustomer,
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type CustomersApi = ReturnType<typeof customersApi>;
