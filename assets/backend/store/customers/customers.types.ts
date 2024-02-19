export type CustomersState = {
	allCustomers: Customer[];
};

export type Customer = {
	id: number;
	name: string;
	email: string;
	phone: string;
};
