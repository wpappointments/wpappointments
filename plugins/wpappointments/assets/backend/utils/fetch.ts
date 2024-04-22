import wpApiFetch, { APIFetchOptions } from '@wordpress/api-fetch';

export type APIResponse<T> = {
	data: T;
	type: 'success' | 'error';
	message?: string;
};

export default function apiFetch<T>(options: APIFetchOptions): Promise<T> {
	const fetchOptions = options;

	if (options.path) {
		fetchOptions.path = window.wpappointments.api.namespace + options.path;
	}

	return wpApiFetch<T>(fetchOptions);
}
