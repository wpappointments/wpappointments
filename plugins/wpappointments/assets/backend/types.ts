import { Output } from 'valibot';
import {
	ApiActionSchema,
	AppointmentSchema,
	BookableEntitySchema,
	BookableTypeSchema,
	BookableVariantSchema,
	CustomerSchema,
	EntitySchema,
	ServiceSchema,
} from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
export type BookableEntity = Output<typeof BookableEntitySchema>;
export type BookableVariant = Output<typeof BookableVariantSchema>;
export type BookableType = Output<typeof BookableTypeSchema>;
export type Customer = Output<typeof CustomerSchema>;
export type Entity = Output<typeof EntitySchema>;
export type Service = Output<typeof ServiceSchema>;
