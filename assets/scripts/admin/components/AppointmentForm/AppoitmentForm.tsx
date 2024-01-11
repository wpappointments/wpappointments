import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { APIResponse } from '~/utils/fetch';
import { useAppointments } from '~/hooks/api/appointments';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import DateTimePicker from '../FormField/DateTimePicker/DateTimePicker';
import Input from '../FormField/Input/Input';
import { formActions } from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';

type Fields = {
	title: string;
	datetime: string;
};

type FormProps = {
	mode: 'view' | 'edit' | 'create';
	onSubmitComplete?: (
		data: APIResponse<{
			appointment: Appointment;
			message: string;
		}>
	) => void;
	defaultDate?: Date;
};

function isSelectedAppointmentValid(data: unknown): data is Appointment {
	return (
		typeof data === 'object' &&
		data !== null &&
		'title' in data &&
		'date' in data &&
		'timeFromTo' in data
	);
}

export default function AppointmentForm({
	mode = 'create',
	onSubmitComplete,
	defaultDate,
}: FormProps) {
	const { createAppointment, updateAppointment } = useAppointments();
	const { currentSlideout } = useSlideout();

	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors },
	} = useForm<Fields>();

	useEffect(() => {
		if (mode === 'create') {
			reset();

			let date = new Date().toISOString();

			if (defaultDate) {
				date = defaultDate.toISOString();
			}

			setValue('datetime', date);

			return;
		}

		if (mode === 'edit' && currentAppointment) {
			if (!isSelectedAppointmentValid(currentAppointment)) {
				return;
			}

			reset();

			const title = currentAppointment.title;
			const timestamp = new Date(
				parseInt(currentAppointment.timestamp) * 1000
			).toISOString();

			setValue('title', title);
			setValue('datetime', timestamp);
		}
	}, [defaultDate, currentAppointment, mode]);

	const onSubmit = async (formData: Fields) => {
		let data;

		if (isSelectedAppointmentValid(currentAppointment)) {
			data = await updateAppointment(currentAppointment.id, formData);
		} else {
			data = await createAppointment(formData);
		}

		if (onSubmitComplete) {
			onSubmitComplete(data);
		}

		if (mode === 'create') {
			reset();
		}
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

			<div className={formActions}>
				<Button type="submit" variant="primary">
					{getSubmitButtonLabel(mode)}
				</Button>
			</div>
		</form>
	);
}
