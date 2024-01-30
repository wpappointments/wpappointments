import { Output } from 'valibot';
import { ApiActionSchema, AppointmentSchema } from './schemas';

export type ApiAction = Output<typeof ApiActionSchema>;
export type Appointment = Output<typeof AppointmentSchema>;
