export type CustomersState = {
	customers: Customer[];
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
};

export type Customer = {
	id?: number;
	name: string;
	email: string;
	phone: string;
	created: string;
};
