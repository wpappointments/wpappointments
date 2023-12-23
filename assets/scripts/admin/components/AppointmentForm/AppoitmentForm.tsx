import { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAppointments } from '~/hooks/api/appointments';
import { Appointment } from '~/types';
import { APIResponse } from '~/utils/fetch';
import Input from '../FormField/Input/Input';
import DateTimePicker from '../FormField/DateTimePicker/DateTimePicker';
import { formActions } from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';

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
	mode: 'view' | 'edit' | 'create';
	setMode: Dispatch<SetStateAction<'view' | 'edit' | 'create'>>;
};

export default function AppointmentForm({
	onSubmitComplete,
	defaultDate,
	selectedAppointment,
	mode = 'create',
	setMode,
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
		if (mode === 'view') {
			reset();
			return;
		}

		if (mode === 'create') {
			reset();

			setValue(
				'datetime',
				defaultDate
					? defaultDate.toISOString()
					: new Date().toISOString()
			);

			return;
		}

		if (mode === 'edit' && selectedAppointment) {
			reset();

			setValue('title', selectedAppointment.title);
			setValue(
				'datetime',
				new Date(
					parseInt(selectedAppointment.timestamp) * 1000
				).toISOString()
			);
		}
	}, [defaultDate, selectedAppointment, mode]);

	const onSubmit = async (formData: Fields) => {
		const data = selectedAppointment
			? await updateAppointment(selectedAppointment.id, formData)
			: await createAppointment(formData);

		if (onSubmitComplete) {
			onSubmitComplete(data);
		}

		reset();
	};

	if (selectedAppointment && mode === 'view') {
		return (
			<>
				<h2>{selectedAppointment?.title}</h2>
				<p>{selectedAppointment?.date}</p>
				<p>{selectedAppointment?.timeFromTo}</p>
				<div className={formActions}>
					<Button
						variant="primary"
						onClick={() => {
							console.log('edit');
							setMode('edit');
						}}
					>
						{getSubmitButtonLabel(mode)}
					</Button>
					<Button
						variant="link"
						isDestructive={true}
						onClick={() => {
							console.log('delete');
						}}
					>
						{__('Delete Appointment')}
					</Button>
				</div>
			</>
		);
	}

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

			<div className={formActions}>
				<Button type="submit" variant="primary">
					{getSubmitButtonLabel(mode)}
				</Button>
			</div>
		</form>
	);
}