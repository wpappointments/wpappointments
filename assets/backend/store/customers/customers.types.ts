export type CustomersState = {
	allCustomers: Customer[];
};

export type Customer = {
	id: number;
	name: string;
	email: string;
	phone: string;
	created_at: string;
	updated_at: string;
};
