import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useAppointments } from '~/hooks/api/appointments';
import { Appointment } from '~/types';
import { APIResponse } from '~/utils/fetch';
import Input from '../FormField/Input/Input';
import DateTimePicker from '../FormField/DateTimePicker/DateTimePicker';
import { __ } from '@wordpress/i18n';

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
	defaultDate?: Date;
	selectedAppointment?: Appointment;
};

export default function NewAppointmentForm({
	onSubmitComplete,
	defaultDate,
	selectedAppointment,
}: FormProps) {
	const { createAppointment, updateAppointment } = useAppointments();
	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<Fields>();

	useEffect(() => {
		reset();

		if (selectedAppointment) {
			setValue('title', selectedAppointment.title);
			setValue(
				'datetime',
				new Date(
					parseInt(selectedAppointment.timestamp) * 1000
				).toISOString()
			);
		} else {
			setValue(
				'datetime',
				defaultDate
					? defaultDate.toISOString()
					: new Date().toISOString()
			);
		}
	}, [defaultDate, selectedAppointment]);

	const onSubmit = async (formData: Fields) => {
		const data = selectedAppointment
			? await updateAppointment(selectedAppointment.id, formData)
			: await createAppointment(formData);

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
				{selectedAppointment
					? __('Update Appointment')
					: __('Create Appointment')}
			</Button>
		</form>
	);
}
