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
	service: string(),
	date: string(),
	time: string(),
	timeFromTo: string(),
	timestamp: union([string(), number()]),
	status: union([
		literal('pending'),
		literal('confirmed'),
		literal('cancelled'),
		literal('no-show'),
	]),
	actions: record(ApiActionSchema),
});
