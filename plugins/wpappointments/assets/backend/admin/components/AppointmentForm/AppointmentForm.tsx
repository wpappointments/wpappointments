import { Button, SelectControl } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	ButtonGroup,
	FormField,
	formFieldStyles,
	FormFieldSet,
	SlideOut,
} from '@wpappointments/components';
import { displayErrorToast } from '@wpappointments/data';
import { useSlideout } from '@wpappointments/data';
import { addMinutes } from 'date-fns';
import { safeParse } from 'valibot';
import { APIResponse } from '~/backend/utils/fetch';
import { formatTimeForPicker } from '~/backend/utils/format';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import { Customer, Appointment } from '~/backend/types';
import CustomerCreate from '../CustomerCreate/CustomerCreate';
import CustomerSelector from '../CustomerSelector/CustomerSelector';
import CustomerSummary from '../CustomerSelector/Summary/Summary';
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

const defaultFormData: AppointmentFormFields = {
	date: '',
	datetime: null,
	service: '',
	status: 'confirmed',
	timeHourStart: '',
	timeMinuteStart: '',
	timeType: 'am',
	duration: 30,
	customer: {
		id: 0,
		name: '',
		email: '',
		phone: '',
		created: '',
		updated: '',
	},
	customerId: 0,
	available: '1',
};

export default function AppointmentForm({ defaultDate }: FormProps) {
	const dispatch = useDispatch(store);
	const [formData, setFormData] =
		useState<AppointmentFormFields>(defaultFormData);

	const setField = <K extends keyof AppointmentFormFields>(
		field: K,
		value: AppointmentFormFields[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

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
	const { selectedAppointment, mode = 'create' } =
		(data as {
			selectedAppointment?: number;
			mode?: 'create' | 'edit';
		}) || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	const selectedCustomer = useSelect(() => {
		return select(store).getSelectedCustomer();
	}, []);

	const defaultCustomer = formData.customer?.name
		? formData.customer
		: selectedCustomer;

	const appointmentsSettings = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);
	const { defaultLength, coreEntityName, coreEntityId } =
		appointmentsSettings;

	const { currentMonth, currentYear } = useSelect(
		(select) => {
			return {
				currentMonth: select(store).getCurrentMonth(),
				currentYear: select(store).getCurrentYear(),
			};
		},
		[formData.datetime]
	);

	useEffect(() => {
		if (mode === 'edit' && currentAppointment) {
			const result = safeParse(AppointmentSchema, currentAppointment);

			if (result.issues) {
				console.error('Appointment data is invalid', result.issues);
				return;
			}

			const date = new Date(currentAppointment.timestamp * 1000);

			setFormData((prev) => ({
				...prev,
				service: currentAppointment.service,
				status: currentAppointment.status,
				date: date.toISOString(),
				datetime: date.getTime().toString(),
				timeHourStart: formatTimeForPicker(date.getHours()),
				timeMinuteStart: formatTimeForPicker(date.getMinutes()),
				duration: currentAppointment.duration,
				customer: {
					...prev.customer,
					name: currentAppointment.customer.name,
					email: currentAppointment.customer.email || '',
					phone: currentAppointment.customer.phone || '',
					created: currentAppointment.customer.created || '',
				},
				customerId: currentAppointment.customerId || 0,
			}));
		} else if (defaultDate) {
			setFormData((prev) => ({
				...prev,
				date: defaultDate.toISOString(),
				datetime: defaultDate.getTime().toString(),
				timeHourStart: formatTimeForPicker(defaultDate.getHours()),
				timeMinuteStart: formatTimeForPicker(defaultDate.getMinutes()),
				duration: defaultLength || 30,
			}));
		}
	}, [mode, defaultLength, currentAppointment?.id, defaultDate]);

	const resetForm = () => {
		setFormData(defaultFormData);
	};

	const onSubmit = async () => {
		if (
			!formData.date ||
			!formData.timeHourStart ||
			!formData.timeMinuteStart
		) {
			displayErrorToast(
				__('Please select a date and time.', 'wpappointments')
			);
			return;
		}

		const date = new Date(formData.date);
		date.setHours(parseInt(formData.timeHourStart, 10));
		date.setMinutes(parseInt(formData.timeMinuteStart, 10));
		date.setSeconds(0);
		date.setMilliseconds(0);

		if (isNaN(date.getTime())) {
			displayErrorToast(__('Invalid date or time.', 'wpappointments'));
			return;
		}

		const submitData = {
			...formData,
			date: date.toISOString(),
		};

		const [error, result] = await resolve<SubmitResponse>(async () => {
			let data;

			if (mode === 'edit' && currentAppointment) {
				data = await updateAppointment(
					currentAppointment.id,
					submitData
				);
			} else {
				data = await createAppointment(submitData);
			}

			return data;
		});

		if (error) {
			displayErrorToast(
				__(
					'Something went wrong while submitting the form.',
					'wpappointments'
				)
			);

			console.error(
				'Something went wrong while submitting the form.',
				error
			);
			return;
		}

		if (result) {
			closeCurrentSlideOut(() => {
				resetForm();
				dispatch.clearSelectedCustomer();
			});
		}

		if (mode === 'create') {
			resetForm();
			dispatch.clearSelectedCustomer();
		}
	};

	const defaultDateToday = new Date();
	defaultDateToday.setMonth(currentMonth);
	defaultDateToday.setFullYear(currentYear);

	const start = new Date(formData.date);

	if (formData.timeHourStart && formData.timeMinuteStart) {
		start.setHours(parseInt(formData.timeHourStart, 10));
		start.setMinutes(parseInt(formData.timeMinuteStart, 10));
		start.setSeconds(0);
		start.setMilliseconds(0);
	}

	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, formData.duration).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, formData.duration).getMinutes()
	);

	const title =
		mode === 'edit'
			? __('Edit Appointment', 'wpappointments')
			: __('Create New Appointment', 'wpappointments');

	const defaultEntityName =
		coreEntityName || __('Appointment', 'wpappointments');

	const handleCustomerSelect = (customer: Customer) => {
		setFormData((prev) => ({
			...prev,
			customerId: customer.id || 0,
			customer: {
				...prev.customer,
				name: customer.name,
				email: customer.email || '',
				phone: customer.phone || '',
				created: customer.created || '',
			},
		}));
	};

	const clearCustomer = () => {
		dispatch.clearSelectedCustomer();
		setFormData((prev) => ({
			...prev,
			customerId: 0,
			customer: {
				...prev.customer,
				name: '',
				email: '',
				phone: '',
				created: '',
			},
		}));
	};

	return (
		<SlideOut title={title} id="appointment">
			<div>
				<FormFieldSet>
					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="service"
						>
							{__('Service', 'wpappointments')}
						</label>
						<SelectControl
							value={
								formData.service ||
								coreEntityId?.toString() ||
								defaultEntityName.toLowerCase()
							}
							options={[
								{
									label: defaultEntityName,
									value:
										coreEntityId?.toString() ||
										defaultEntityName.toLowerCase(),
								},
							]}
							disabled={true}
							onChange={(value) => setField('service', value)}
							id="service"
							size="__unstable-large"
							hideLabelFromVision
							label={__('Service', 'wpappointments')}
						/>
					</FormField>

					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="status"
						>
							{__('Status', 'wpappointments')}
						</label>
						<SelectControl
							value={
								formData.status ||
								(mode === 'edit' && currentAppointment
									? currentAppointment.status
									: 'confirmed')
							}
							options={[
								{
									label: __('Pending', 'wpappointments'),
									value: 'pending',
								},
								{
									label: __('Confirmed', 'wpappointments'),
									value: 'confirmed',
								},
								{
									label: __('Cancelled', 'wpappointments'),
									value: 'cancelled',
								},
								{
									label: __('No Show', 'wpappointments'),
									value: 'noshow',
								},
							]}
							onChange={(value) =>
								setField(
									'status',
									value as Appointment['status']
								)
							}
							id="status"
							size="__unstable-large"
							hideLabelFromVision
							label={__('Status', 'wpappointments')}
						/>
					</FormField>

					<FormFieldSet
						legend={__('Date and time', 'wpappointments')}
						style={{
							display: formData.datetime ? 'none' : 'block',
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
								{__('Select time', 'wpappointments')}
							</Button>
						</FormFieldSet>
					</FormFieldSet>

					{formData.datetime && formData.date && (
						<Summary
							date={new Date(formData.date)}
							timeHourStart={formData.timeHourStart}
							timeMinuteStart={formData.timeMinuteStart}
							timeHourEnd={timeHourEnd}
							timeMinuteEnd={timeMinuteEnd}
							duration={formData.duration}
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
									>
										{__('Change', 'wpappointments')}
									</Button>
									<Button
										size="small"
										variant="secondary"
										onClick={clearCustomer}
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
						variant="primary"
						onClick={onSubmit}
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
						formData={formData}
						setField={setField}
					/>
				)}
				{isSlideoutOpen('select-customer') && (
					<CustomerSelector onCustomerSelect={handleCustomerSelect} />
				)}
				{isSlideoutOpen('customer') && (
					<CustomerCreate
						onSubmitSuccess={(data: Customer) => {
							handleCustomerSelect(data);
						}}
					/>
				)}
			</div>
		</SlideOut>
	);
}
