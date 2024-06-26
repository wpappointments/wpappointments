import { useFormContext } from 'react-hook-form';
import { Button, ButtonGroup } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addMinutes } from 'date-fns';
import { safeParse } from 'valibot';
import { APIResponse } from '~/backend/utils/fetch';
import { formatTimeForPicker } from '~/backend/utils/format';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast } from '~/backend/utils/toast';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Customer, Appointment } from '~/backend/types';
import CustomerCreate from '../CustomerCreate/CustomerCreate';
import CustomerSelector from '../CustomerSelector/CustomerSelector';
import CustomerSummary from '../CustomerSelector/Summary/Summary';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
import Select from '../FormField/Select/Select';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import Summary from '../TimeSelector/Summary/Summary';
import TimeSelector from '../TimeSelector/TimeSelector';
import styles from './AppointmentForm.module.css';
import { getSubmitButtonLabel } from './utils';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { appointmentsApi } from '~/backend/api/appointments';
import { AppointmentSchema } from '~/backend/schemas';

export type AppointmentFormFields = {
	date: string;
	datetime: string | null;
	service: string;
	status: Appointment['status'];
	timeHourStart: string;
	timeMinuteStart: string;
	timeType: 'am' | 'pm';
	duration: number;
	customer: {
		id: number;
		name: string;
		email: string;
		phone: string;
		created: string;
		updated: string;
	};
	customerId: number;
	available: string;
};

type SubmitResponse = APIResponse<{
	appointment: Appointment;
	message: string;
}>;

type FormProps = {
	defaultDate?: Date;
};

export default withForm<FormProps>(function AppointmentFormFields({
	defaultDate,
}: FormProps) {
	const dispatch = useDispatch(store);
	const { reset, setValue, watch } = useFormContext<AppointmentFormFields>();

	const { invalidate } = useStateContext();
	const { createAppointment, updateAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});
	const {
		currentSlideout,
		openSlideOut,
		closeCurrentSlideOut,
		isSlideoutOpen,
	} = useSlideout({
		id: 'appointment',
	});

	const { data } = currentSlideout || {};
	const { selectedAppointment, mode } = (data as any) || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	const selectedCustomer = useSelect(() => {
		return select(store).getSelectedCustomer();
	}, []);

	const datetime = watch('datetime');
	const date = watch('date');
	const timeHourStart = watch('timeHourStart');
	const timeMinuteStart = watch('timeMinuteStart');
	const duration = watch('duration');
	const customer = watch('customer');

	const defaultCustomer = customer || selectedCustomer;
	const appointmentsSettings = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);
	const { defaultLength, serviceName, serviceId } = appointmentsSettings;

	const { currentMonth, currentYear } = useSelect(
		(select) => {
			return {
				currentMonth: select(store).getCurrentMonth(),
				currentYear: select(store).getCurrentYear(),
			};
		},
		[datetime]
	);

	useEffect(() => {
		if (mode === 'edit' && currentAppointment) {
			const result = safeParse(AppointmentSchema, currentAppointment);

			if (result.issues) {
				console.error('Appointment data is invalid', result.issues);
				return;
			}

			const service = currentAppointment.service;
			const status = currentAppointment.status;
			const date = new Date(currentAppointment.timestamp * 1000);
			const timeHourStart = formatTimeForPicker(date.getHours());
			const timeMinuteStart = formatTimeForPicker(date.getMinutes());
			const duration = currentAppointment.duration;
			const customer = currentAppointment.customer;
			const customerId = currentAppointment.customerId;

			setValue('service', service);
			setValue('status', status);
			setValue('date', date.toISOString());
			setValue('datetime', date.getTime().toString());
			setValue('timeHourStart', timeHourStart);
			setValue('timeMinuteStart', timeMinuteStart);
			setValue('duration', duration);
			setValue('customer.name', customer.name);
			setValue('customer.email', customer.email || '');
			setValue('customer.phone', customer.phone || '');
			setValue('customer.created', customer.created || '');
			setValue('customerId', customerId || 0);
		} else if (defaultDate) {
			const timeHourStart = formatTimeForPicker(defaultDate.getHours());
			const timeMinuteStart = formatTimeForPicker(
				defaultDate.getMinutes()
			);
			setValue('date', defaultDate?.toISOString());
			setValue('datetime', defaultDate?.getTime().toString());
			setValue('timeHourStart', timeHourStart);
			setValue('timeMinuteStart', timeMinuteStart);
			setValue('duration', defaultLength || 30);
		}
	}, [mode, defaultLength]);

	const onSubmit = async (formData: AppointmentFormFields) => {
		const date = new Date(formData.date);
		date.setHours(parseInt(formData.timeHourStart));
		date.setMinutes(parseInt(formData.timeMinuteStart));
		date.setSeconds(0);
		date.setMilliseconds(0);

		formData.date = date.toISOString();

		const [error, result] = await resolve<SubmitResponse>(async () => {
			let data;

			if (mode === 'edit' && currentAppointment) {
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

		if (result) {
			closeCurrentSlideOut(() => {
				reset();
				dispatch.clearSelectedCustomer();
			});
		}

		if (mode === 'create') {
			reset();
			dispatch.clearSelectedCustomer();
			setValue('datetime', null);
			setValue('customerId', 0);
			setValue('customer.name', '');
			setValue('customer.email', '');
			setValue('customer.phone', '');
			setValue('customer.created', '');
		}
	};

	const defaultDateToday = new Date();
	defaultDateToday.setMonth(currentMonth);
	defaultDateToday.setFullYear(currentYear);

	const start = new Date(date);

	if (timeHourStart && timeMinuteStart) {
		start.setHours(parseInt(timeHourStart));
		start.setMinutes(parseInt(timeMinuteStart));
		start.setSeconds(0);
		start.setMilliseconds(0);
	}

	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, duration).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, duration).getMinutes()
	);

	const title =
		mode === 'edit'
			? __('Edit Appointment', 'wpappointments')
			: __('Create New Appointment', 'wpappointments');

	const defaultServiceName = serviceName || 'Appointment';

	return (
		<SlideOut title={title} id="appointment">
			<HtmlForm onSubmit={onSubmit}>
				<FormFieldSet>
					<Select
						name="service"
						label="Service"
						rules={{
							required: true,
						}}
						defaultValue={
							mode === 'edit' && currentAppointment
								? currentAppointment?.service
								: defaultServiceName
						}
						readOnly={true}
						options={[
							{
								label: defaultServiceName,
								value:
									serviceId?.toString() ||
									defaultServiceName.toLowerCase(),
							},
						]}
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
							{ label: 'No Show', value: 'noshow' },
						]}
						defaultValue={
							mode === 'edit' && currentAppointment
								? currentAppointment?.status
								: 'confirmed'
						}
					/>

					<FormFieldSet
						legend={__('Date and time', 'wpappointments')}
						style={{
							display: datetime ? 'none' : 'block',
						}}
					>
						<FormFieldSet horizontal horizontalCenter>
							<span className={styles.noTimeLabel}>
								{__('No time selected', 'wpappointments')}
							</span>
							<Button
								variant="secondary"
								size="small"
								onClick={() => {
									openSlideOut({
										id: `select-time`,
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
							defaultValue={
								mode === 'edit' && currentAppointment
									? currentAppointment.timestamp * 1000
									: defaultDate?.getTime().toString()
							}
							rules={{
								required: true,
							}}
						/>
					</FormFieldSet>

					{datetime && date && (
						<Summary
							date={new Date(date)}
							timeHourStart={timeHourStart}
							timeMinuteStart={timeMinuteStart}
							timeHourEnd={timeHourEnd}
							timeMinuteEnd={timeMinuteEnd}
							duration={duration}
							showAvailabilityWarning={false}
							headerActions={
								<Button
									size="small"
									variant="secondary"
									onClick={() => {
										openSlideOut({
											id: 'select-time',
										});
									}}
								>
									{__('Change', 'wpappointments')}
								</Button>
							}
						/>
					)}

					<FormFieldSet
						legend={__('Customer', 'wpappointments')}
						style={{
							display:
								selectedCustomer || defaultCustomer?.name
									? 'none'
									: 'block',
						}}
					>
						<FormFieldSet horizontal horizontalCenter>
							<span className={styles.noTimeLabel}>
								{__('No customer selected', 'wpappointments')}
							</span>
							<ButtonGroup>
								<Button
									variant="secondary"
									size="small"
									onClick={() => {
										openSlideOut({
											id: `select-customer`,
										});
									}}
								>
									{__('Select customer', 'wpappointments')}
								</Button>
								<Button
									variant="secondary"
									size="small"
									onClick={() => {
										openSlideOut({
											id: 'customer',
											data: {
												mode: 'create',
											},
										});
									}}
								>
									{__('New customer', 'wpappointments')}
								</Button>
							</ButtonGroup>
						</FormFieldSet>

						<Input type="hidden" name="customerId" />

						<Input
							type="hidden"
							name="customer[name]"
							rules={{
								required: true,
							}}
						/>
						<Input
							type="hidden"
							name="customer[email]"
							rules={{
								required: true,
							}}
						/>
						<Input
							type="hidden"
							name="customer[phone]"
							rules={{
								required: true,
							}}
						/>
						<Input
							type="hidden"
							name="customer[created]"
							rules={{
								required: true,
							}}
						/>
					</FormFieldSet>

					{defaultCustomer?.name && (
						<CustomerSummary
							customer={defaultCustomer}
							headerActions={
								<ButtonGroup>
									<Button
										size="small"
										variant="secondary"
										onClick={() => {
											openSlideOut({
												id: `select-customer`,
											});
										}}
										style={{
											margin: '0 4px',
										}}
									>
										{__('Change', 'wpappointments')}
									</Button>
									<Button
										size="small"
										variant="secondary"
										onClick={() => {
											dispatch.clearSelectedCustomer();
											setValue('customerId', 0);
											setValue('customer.name', '');
											setValue('customer.email', '');
											setValue('customer.phone', '');
											setValue('customer.created', '');
										}}
									>
										{__('Clear', 'wpappointments')}
									</Button>
								</ButtonGroup>
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

				{isSlideoutOpen('select-time') && (
					<TimeSelector
						mode={mode}
						appointment={currentAppointment}
					/>
				)}
				{isSlideoutOpen('select-customer') && <CustomerSelector />}
				{isSlideoutOpen('customer') && (
					<CustomerCreate
						onSubmitSuccess={(data: Customer) => {
							setValue('customerId', 0);
							setValue('customer.name', data.name);
							setValue('customer.email', data.email || '');
							setValue('customer.phone', data.phone || '');
							setValue('customer.created', data.created || '');
						}}
					/>
				)}
			</HtmlForm>
		</SlideOut>
	);
});
