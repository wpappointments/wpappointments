import { Output } from 'valibot';
import { ApiActionSchema, AppointmentSchema, CustomerSchema, ServiceSchema } from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
export type Customer = Output<typeof CustomerSchema>;
export type Service = Output<typeof ServiceSchema>;
