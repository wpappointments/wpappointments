import {
	boolean,
	literal,
	number,
	object,
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
	title: string(),
	date: string(),
	time: string(),
	timeFromTo: string(),
	timestamp: union([string(), number()]),
	status: union([
		literal('active'),
		literal('cancelled'),
		literal('completed'),
		literal('no-show'),
	]),
	actions: record(ApiActionSchema),
});
