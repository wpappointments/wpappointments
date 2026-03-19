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

export const ServiceSchema = object({
	id: optional(number()),
	name: string(),
	duration: optional(number()),
	description: optional(string()),
	active: optional(boolean()),
	price: optional(number()),
	category: optional(string()),
	image: optional(string()),
});

export const BookableEntitySchema = object({
	id: optional(number()),
	name: string(),
	active: optional(boolean()),
	description: optional(string()),
	type: optional(string()),
	image: optional(string()),
	imageId: optional(number()),
	scheduleId: optional(number()),
	bufferBefore: optional(number()),
	bufferAfter: optional(number()),
	minLeadTime: optional(number()),
	maxLeadTime: optional(number()),
	duration: optional(number()),
	attributes: optional(
		array(
			object({
				name: string(),
				values: array(string()),
			})
		)
	),
});

export const BookableVariantSchema = object({
	id: optional(number()),
	parentId: optional(number()),
	name: optional(string()),
	active: optional(boolean()),
	attributeValues: optional(object({})),
	overrides: optional(array(string())),
	duration: optional(number()),
	scheduleId: optional(number()),
	bufferBefore: optional(number()),
	bufferAfter: optional(number()),
	minLeadTime: optional(number()),
	maxLeadTime: optional(number()),
});

export const BookableTypeSchema = object({
	slug: string(),
	label: string(),
	fields: optional(object({})),
	variantOverridableFields: optional(array(string())),
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
