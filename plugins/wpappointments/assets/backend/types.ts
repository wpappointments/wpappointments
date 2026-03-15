import { Output } from 'valibot';
import {
	ApiActionSchema,
	AppointmentSchema,
	CustomerSchema,
	EntitySchema,
	ServiceSchema,
} from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
export type Customer = Output<typeof CustomerSchema>;
export type Entity = Output<typeof EntitySchema>;
export type Service = Output<typeof ServiceSchema>;
