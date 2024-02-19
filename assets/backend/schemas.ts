import {
	boolean,
	literal,
	number,
	object,
	optional,
	record,
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
	customer: object({
		id: number(),
		name: string(),
		email: string(),
		phone: string(),
	}),
	customerId: optional(number()),
	actions: record(ApiActionSchema),
});
