import { __ } from '@wordpress/i18n';
import { Error, getErrorMessage } from '~/backend/utils/error';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';

type CustomerData = {
	name: string;
	email: string;
	phone: string;
};

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

	async function getAllCustomers() {
		return select.getAllCustomers();
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

		if (response) {
			const { data: responseData } = response;
			const { customer } = responseData;

			dispatch.createCustomer(customer);

			displaySuccessToast(
				__('Customer created successfully', 'wpappointments')
			);

			if (invalidateCache) {
				invalidateCache('getAllCustomers');
			}
		}

		return response;
	}

	function handleError(error: Error, message: string) {
		displayErrorToast(`${message}: ${getErrorMessage(error)}`);

		console.error('Error: ' + getErrorMessage(error));
	}

	const functions = {
		getAllCustomers,
		createCustomer,
	} as const;

	window.wpappointments.api = {
		...window.wpappointments.api,
		...functions,
	};

	return functions;
}

export type CustomersApi = ReturnType<typeof customersApi>;
