import {
	boolean,
	literal,
	number,
	object,
	optional,
	string,
	union,
} from 'valibot';

export const ApiActionSchema = object({
	name: string(),
	label: string(),
	method: string(),
	uri: string(),
	isDangerous: boolean(),
});

export const CustomerSchema = object({
	id: optional(number()),
	name: string(),
	email: optional(string()),
	phone: optional(string()),
	created: optional(string()),
});

export const AppointmentSchema = object({
	id: number(),
	timestamp: number(),
	duration: number(),
	service: string(),
	status: union([
		literal('pending'),
		literal('confirmed'),
		literal('cancelled'),
		literal('noshow'),
	]),
	customer: CustomerSchema,
	customerId: optional(number()),
});
