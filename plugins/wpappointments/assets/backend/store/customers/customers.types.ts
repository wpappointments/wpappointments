import { Customer } from '~/backend/types';

export type CustomersState = {
	customers: Customer[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};
