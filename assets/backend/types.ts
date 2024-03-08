import { Output } from 'valibot';
import { ApiActionSchema, AppointmentSchema, CustomerSchema } from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
export type Customer = Output<typeof CustomerSchema>;
