import {
	array,
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

export const ServiceCategorySchema = object({
	id: number(),
	name: string(),
	slug: string(),
	count: optional(number()),
});

export const ServiceSchema = object({
	id: optional(number()),
	name: string(),
	duration: optional(number()),
	description: optional(string()),
	active: optional(boolean()),
	price: optional(number()),
	category: optional(union([ServiceCategorySchema, literal('')])),
	image: optional(string()),
	imageId: optional(number()),
});

export const EntitySchema = object({
	id: optional(number()),
	name: string(),
	parentId: optional(number()),
	active: optional(boolean()),
	description: optional(string()),
	type: optional(string()),
	capacity: optional(number()),
	image: optional(string()),
	scheduleId: optional(number()),
	scheduleMode: optional(union([literal('inherit'), literal('own')])),
	bufferBefore: optional(number()),
	bufferAfter: optional(number()),
	minLeadTime: optional(number()),
	maxLeadTime: optional(number()),
	sortOrder: optional(number()),
	depth: optional(number()),
	childrenCount: optional(number()),
	children: optional(array(object({}))),
});
