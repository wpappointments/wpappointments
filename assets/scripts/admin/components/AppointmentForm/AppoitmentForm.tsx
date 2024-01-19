import { useForm } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { array, boolean, date, is, number, object } from 'valibot';
import { APIResponse } from '~/utils/fetch';
import resolve from '~/utils/resolve';
import { displayErrorToast } from '~/utils/toast';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import DateTimePicker from '../FormField/DateTimePicker/DateTimePicker';
import Input from '../FormField/Input/Input';
import Select from '../FormField/Select/Select';
import { formActions } from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';
import { useStateContext } from '~/admin/context/StateContext';
import { appointmentsApi } from '~/api/appointments';
import { AppointmentSchema } from '~/schemas';

type Fields = {
	title: string;
	datetime: string;
	status: Appointment['status'];
};

type SubmitResponse = APIResponse<{
	appointment: Appointment;
	message: string;
}>;

type FormProps = {
	mode: 'view' | 'edit' | 'create';
	onSubmitComplete?: (data: SubmitResponse) => void;
	defaultDate?: Date;
};

const AddAppointmentDataSchema = object({
	index: number(),
	isNextMonth: boolean(),
	isPreviousMonth: boolean(),
	isToday: boolean(),
	start: date(),
	end: date(),
	appointments: array(AppointmentSchema),
});

export default function AppointmentForm({
	mode = 'create',
	onSubmitComplete,
	defaultDate,
}: FormProps) {
	const { invalidate } = useStateContext();
	const { createAppointment, updateAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});
	const { currentSlideout } = useSlideout();

	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment, currentSlideout]);

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
			} else if (is(AddAppointmentDataSchema, currentSlideout?.data)) {
				date = new Date(currentSlideout.data.start).toISOString();
			}

			setValue('datetime', date);

			return;
		}

		if (mode === 'edit' && currentAppointment) {
			if (!is(AppointmentSchema, currentAppointment)) {
				return;
			}

			reset();

			const title = currentAppointment.title;
			const timestamp = new Date(
				parseInt(currentAppointment.timestamp.toString()) * 1000
			).toISOString();
			const status = currentAppointment.status;

			setValue('title', title);
			setValue('datetime', timestamp);
			setValue('status', status);
		}
	}, [defaultDate, currentSlideout, currentAppointment, mode]);

	const onSubmit = async (formData: Fields) => {
		const [error, result] = await resolve<SubmitResponse>(async () => {
			let data;

			if (is(AppointmentSchema, currentAppointment)) {
				data = await updateAppointment(currentAppointment.id, formData);
			} else {
				data = await createAppointment(formData);
			}

			return data;
		});

		if (error) {
			displayErrorToast(
				__('Something went wrong while submitting the form.')
			);

			console.error(
				'Something went wrong while submitting the form.',
				error
			);
			return;
		}

		if (onSubmitComplete && result) {
			onSubmitComplete(result);
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

			{mode === 'edit' && (
				<Select
					control={control}
					errors={errors}
					name="status"
					label="Status"
					rules={{
						required: true,
					}}
					options={[
						{ label: 'Active', value: 'active' },
						{ label: 'Completed', value: 'completed' },
						{ label: 'Cancelled', value: 'cancelled' },
						{ label: 'No Show', value: 'no-show' },
					]}
				/>
			)}

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
