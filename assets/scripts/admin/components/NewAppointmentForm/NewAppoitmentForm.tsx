import { Button } from '@wordpress/components';
import { useForm } from 'react-hook-form';
import { useAppointments } from '~/hooks/api/appointments';
import { Appointment } from '~/types';
import { APIResponse } from '~/utils/fetch';
import Input from '../FormField/Input/Input';
import DateTimePicker from '../FormField/DateTimePicker/DateTimePicker';

type Fields = {
	title: string;
	datetime: string;
};

type FormProps = {
	onSubmitComplete?: (
		data: APIResponse<{
			appointment: Appointment;
			message: string;
		}>
	) => void;
};

export default function NewAppointmentForm({ onSubmitComplete }: FormProps) {
	const { createAppointment } = useAppointments();
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<Fields>();

	const onSubmit = async (formData: Fields) => {
		const data = await createAppointment(formData);

		if (onSubmitComplete) {
			onSubmitComplete(data);
		}

		reset();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Input
				control={control}
				errors={errors}
				name="title"
				label="Title"
				placeholder="Eg. Meeting with John Doe"
				rules={{
					required: true,
				}}
			/>

			<div style={{ maxWidth: '300px' }}>
				<DateTimePicker
					control={control}
					errors={errors}
					name="datetime"
					label="Date and Time"
				/>
			</div>

			<Button type="submit" variant="primary">
				Create Appointment
			</Button>
		</form>
	);
}
