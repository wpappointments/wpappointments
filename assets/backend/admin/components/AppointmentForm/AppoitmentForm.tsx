import { useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addMinutes } from 'date-fns';
import { is } from 'valibot';
import { APIResponse } from '~/utils/fetch';
import { formatTimeForPicker } from '~/utils/format';
import resolve from '~/utils/resolve';
import { displayErrorToast } from '~/utils/toast';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
import Select from '../FormField/Select/Select';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import Summary from '../TimeSelector/Summary/Summary';
import TimeSelector from '../TimeSelector/TimeSelector';
import styles from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';
import { useStateContext } from '~/admin/context/StateContext';
import { appointmentsApi } from '~/api/appointments';
import { AppointmentSchema } from '~/schemas';

export type AppointmentFormFields = {
	date: string;
	datetime: string;
	service: string;
	status: Appointment['status'];
	timeHourStart: string;
	timeMinuteStart: string;
	timeType: 'am' | 'pm';
	duration: number;
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
	const { reset, setValue, getValues, watch } =
		useFormContext<AppointmentFormFields>();
	const { invalidate } = useStateContext();
	const { createAppointment, updateAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});
	const { currentSlideout, openSlideOut } = useSlideout();
	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment, currentSlideout]);

	const date = watch('datetime');

	const { currentMonth, currentYear } = useSelect(
		(select) => {
			return {
				currentMonth: select(store).getCurrentMonth(),
				currentYear: select(store).getCurrentYear(),
			};
		},
		[date]
	);

	useEffect(() => {
		if (!date) {
			return;
		}

		const currentDay = new Date(date).getDate();
		const newDate = new Date(
			currentYear,
			currentMonth,
			currentDay,
			0,
			0,
			0
		);

		setValue('datetime', newDate.toISOString());
	}, [currentMonth]);

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

	const onSubmit = async (formData: AppointmentFormFields) => {
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

	const defaultDateToday = new Date();
	defaultDateToday.setMonth(currentMonth);
	defaultDateToday.setFullYear(currentYear);

	const start = new Date(date);
	start.setHours(parseInt(getValues('timeHourStart')));
	start.setMinutes(parseInt(getValues('timeMinuteStart')));
	start.setSeconds(0);
	start.setMilliseconds(0);

	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, getValues('duration')).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, getValues('duration')).getMinutes()
	);

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFieldSet>
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

				<Select
					name="status"
					label="Status"
					rules={{
						required: true,
					}}
					options={[
						{ label: 'Pending', value: 'pending' },
						{ label: 'Confirmed', value: 'confirmed' },
						{ label: 'Cancelled', value: 'cancelled' },
						{ label: 'No Show', value: 'no-show' },
					]}
					defaultValue={
						mode === 'edit'
							? currentAppointment?.status
							: 'confirmed'
					}
				/>

				<FormFieldSet
					legend={__('Date and time')}
					style={{
						display: date ? 'none' : 'block',
					}}
				>
					<FormFieldSet horizontal horizontalCenter>
						<span className={styles.noTimeLabel}>
							No time selected
						</span>
						<Button
							variant="secondary"
							size="small"
							onClick={() => {
								openSlideOut({
									id: `select-time-${mode}`,
									parentId: 'add-appointment',
									data: {
										defaultDate,
										defaultDateToday,
									},
								});
							}}
						>
							Select time
						</Button>
					</FormFieldSet>

					<Input
						type="hidden"
						name="datetime"
						rules={{
							required: true,
						}}
					/>
				</FormFieldSet>

				{date && (
					<Summary
						date={new Date(getValues('date'))}
						timeHourStart={getValues('timeHourStart')}
						timeMinuteStart={getValues('timeMinuteStart')}
						timeHourEnd={timeHourEnd}
						timeMinuteEnd={timeMinuteEnd}
						duration={getValues('duration')}
						headerActions={
							<Button
								size="small"
								variant="secondary"
								onClick={() => {
									openSlideOut({
										id: `select-time-${mode}`,
										parentId: 'add-appointment',
										data: {
											defaultDate: new Date(date),
											defaultDateToday,
											duration: getValues('duration'),
										},
									});
								}}
							>
								Edit
							</Button>
						}
					/>
				)}
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

			<SlideOut title={__('Select time')} id={`select-time-${mode}`}>
				<TimeSelector mode={mode} />
			</SlideOut>
		</HtmlForm>
	);
});
