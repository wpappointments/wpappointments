import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { is } from 'valibot';
import { getNextRoundHourDate } from '~/utils/datetime';
import { APIResponse } from '~/utils/fetch';
import resolve from '~/utils/resolve';
import { displayErrorToast } from '~/utils/toast';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import { HtmlForm, withForm } from '../Form/Form';
import DatePicker from '../FormField/DatePicker/DatePicker';
import Select from '../FormField/Select/Select';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import StartEndTimePicker from '../StartEndTimePicker/StartEndTimePicker';
import styles from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';
import { useStateContext } from '~/admin/context/StateContext';
import { appointmentsApi } from '~/api/appointments';
import { AppointmentSchema } from '~/schemas';

type Fields = {
	date: string;
	service: string;
	status: Appointment['status'];
	timeHourStart: string;
	timeMinuteStart: string;
	timeHourEnd: string;
	timeMinuteEnd: string;
	timeType: 'am' | 'pm';
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

export default withForm<FormProps>(function AppointmentFormFields({
	mode,
	onSubmitComplete,
	defaultDate,
}: FormProps) {
	const { reset, setValue, getValues } = useFormContext<Fields>();
	const { invalidate } = useStateContext();
	const { createAppointment, updateAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});
	const { currentSlideout, openSlideOut } = useSlideout();
	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment, currentSlideout]);

	useEffect(() => {
		if (mode === 'edit' && currentAppointment) {
			if (!is(AppointmentSchema, currentAppointment)) {
				return;
			}

			reset();

			const service = currentAppointment.service;
			const status = currentAppointment.status;

			setValue('service', service);
			setValue('status', status);
		}
	}, [defaultDate, currentSlideout, currentAppointment, mode]);

	const onSubmit = async (formData: Fields) => {
		const date = new Date(formData.date);
		date.setHours(parseInt(formData.timeHourStart));
		date.setMinutes(parseInt(formData.timeMinuteStart));
		date.setSeconds(0);
		date.setMilliseconds(0);

		formData.date = date.toISOString();

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
		<HtmlForm onSubmit={onSubmit}>
			<FormFieldSet>
				{mode === 'edit' && (
					<Select
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

				<Select
					name="service"
					label="Service"
					rules={{
						required: true,
					}}
					defaultValue={
						mode === 'edit'
							? currentAppointment?.service
							: 'consultation'
					}
					readOnly={true}
					options={[{ label: 'Consultation', value: 'consultation' }]}
				/>

				<FormFieldSet
					horizontal
					horizontalCenter
					style={{ alignItems: 'center' }}
				>
					Having trouble finding available time slot?{' '}
					<Button
						icon={calendar}
						onClick={() => {
							openSlideOut({
								id: 'find-time',
								data: getValues(),
								level: 2,
								parentId: 'add-appointment',
							});
						}}
					>
						Find time
					</Button>
				</FormFieldSet>

				<FormFieldSet legend="Select day" style={{ maxWidth: '300px' }}>
					<DatePicker
						name="date"
						label="Date"
						isInvalidDate={(date) => {
							return (
								new Date() > date ||
								date.getDay() === 0 ||
								date.getDay() === 6
							);
						}}
						startOfWeek={1}
						defaultValue={defaultDate || getNextRoundHourDate()}
						events={[
							{
								date: new Date('2024-01-22T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-24T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-26T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-28T21:22:50.694Z'),
							},
						]}
					/>
				</FormFieldSet>

				<StartEndTimePicker date={new Date(getValues('date'))} />
			</FormFieldSet>

			<div className={styles.formActions}>
				<Button
					type="submit"
					variant="primary"
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: '22px 0px',
					}}
				>
					{getSubmitButtonLabel(mode)}
				</Button>
			</div>
		</HtmlForm>
	);
});
