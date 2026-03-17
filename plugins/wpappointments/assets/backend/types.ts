import { Output } from 'valibot';
import {
	ApiActionSchema,
	AppointmentSchema,
	CustomerSchema,
	EntitySchema,
	ServiceCategorySchema,
	ServiceSchema,
} from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
export type Customer = Output<typeof CustomerSchema>;
export type Entity = Output<typeof EntitySchema>;
export type Service = Output<typeof ServiceSchema>;
export type ServiceCategory = Output<typeof ServiceCategorySchema>;
