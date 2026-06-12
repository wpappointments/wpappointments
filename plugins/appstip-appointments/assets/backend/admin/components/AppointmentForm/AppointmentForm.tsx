import { Button, SelectControl, ToggleControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	ButtonGroup,
	FormField,
	formFieldStyles,
	FormFieldSet,
	SlideOut,
	WPDatePicker,
} from '@wpappointments/components';
import { displayErrorToast } from '@wpappointments/data';
import { useSlideout } from '@wpappointments/data';
import { addMinutes, isBefore, startOfDay } from 'date-fns';
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
	allDay: boolean;
	endDate: string;
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
	duration: 0,
	allDay: false,
	endDate: '',
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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showEndDate, setShowEndDate] = useState(false);

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

	const currentAppointment = useSelect(
		(select) => {
			return select(store).getAppointment(selectedAppointment as number);
		},
		[selectedAppointment]
	);

	const selectedCustomer = useSelect((select) => {
		return select(store).getSelectedCustomer();
	}, []);

	const defaultCustomer = formData.customer?.name
		? formData.customer
		: selectedCustomer;

	const appointmentsSettings = useSelect((select) => {
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
		if (formData.duration === 0 && defaultLength) {
			setFormData((prev) => ({
				...prev,
				duration: defaultLength,
			}));
		}
	}, [defaultLength, formData.duration]);

	useEffect(() => {
		if (mode === 'edit' && currentAppointment) {
			const result = safeParse(AppointmentSchema, currentAppointment);

			if (result.issues) {
				console.error('Appointment data is invalid', result.issues);
				return;
			}

			const date = new Date(currentAppointment.timestamp * 1000);
			const endDate = currentAppointment.endTimestamp
				? new Date(currentAppointment.endTimestamp * 1000)
				: null;

			// Reveal the end-date calendar when editing an appointment that
			// already has an end date set.
			setShowEndDate(!!endDate);

			setFormData((prev) => ({
				...prev,
				service: currentAppointment.service,
				status: currentAppointment.status,
				date: date.toISOString(),
				datetime: date.getTime().toString(),
				timeHourStart: formatTimeForPicker(date.getHours()),
				timeMinuteStart: formatTimeForPicker(date.getMinutes()),
				duration: currentAppointment.duration,
				allDay: currentAppointment.allDay || false,
				endDate: endDate ? endDate.toISOString() : '',
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
		if (isSubmitting) return;

		if (!formData.date) {
			displayErrorToast(
				__('Please select a date.', 'appstip-appointments')
			);
			return;
		}

		if (
			!formData.allDay &&
			(!formData.timeHourStart || !formData.timeMinuteStart)
		) {
			displayErrorToast(
				__('Please select a date and time.', 'appstip-appointments')
			);
			return;
		}

		const date = new Date(formData.date);

		if (formData.allDay) {
			date.setHours(0);
			date.setMinutes(0);
		} else {
			date.setHours(parseInt(formData.timeHourStart, 10));
			date.setMinutes(parseInt(formData.timeMinuteStart, 10));
		}
		date.setSeconds(0);
		date.setMilliseconds(0);

		if (isNaN(date.getTime())) {
			displayErrorToast(
				__('Invalid date or time.', 'appstip-appointments')
			);
			return;
		}

		let endDateIso: string | undefined;

		if (formData.endDate) {
			const endDate = new Date(formData.endDate);

			if (isNaN(endDate.getTime())) {
				displayErrorToast(
					__('Invalid end date.', 'appstip-appointments')
				);
				return;
			}

			if (isBefore(startOfDay(endDate), startOfDay(date))) {
				displayErrorToast(
					__(
						'End date cannot be before the start date.',
						'appstip-appointments'
					)
				);
				return;
			}

			// Multi-day span end time: mirror the start time-of-day, or
			// end-of-day for all-day appointments. Only send endDate when it
			// resolves to a moment strictly after the start, matching the
			// backend requirement for setting the end_timestamp meta.
			if (formData.allDay) {
				endDate.setHours(23);
				endDate.setMinutes(59);
				endDate.setSeconds(59);
			} else {
				endDate.setHours(parseInt(formData.timeHourStart, 10));
				endDate.setMinutes(parseInt(formData.timeMinuteStart, 10));
				endDate.setSeconds(0);
			}
			endDate.setMilliseconds(0);

			if (endDate.getTime() > date.getTime()) {
				endDateIso = endDate.toISOString();
			}
		}

		const submitData = {
			...formData,
			service:
				formData.service ||
				coreEntityId?.toString() ||
				defaultEntityName.toLowerCase(),
			date: date.toISOString(),
			entityId: coreEntityId,
			allDay: formData.allDay,
			// Overwrite the raw local-only `endDate` field: send the computed
			// ISO end date, or `undefined` (dropped by JSON serialization) when
			// there is no valid multi-day end.
			endDate: endDateIso,
		};

		setIsSubmitting(true);

		try {
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
						'appstip-appointments'
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
		} finally {
			setIsSubmitting(false);
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
			? __('Edit Appointment', 'appstip-appointments')
			: __('Create New Appointment', 'appstip-appointments');

	const defaultEntityName =
		coreEntityName || __('Appointment', 'appstip-appointments');

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
							{__('Service', 'appstip-appointments')}
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
							label={__('Service', 'appstip-appointments')}
						/>
					</FormField>

					<FormField>
						<label
							className={formFieldStyles.fieldLabel}
							htmlFor="status"
						>
							{__('Status', 'appstip-appointments')}
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
									label: __(
										'Pending',
										'appstip-appointments'
									),
									value: 'pending',
								},
								{
									label: __(
										'Confirmed',
										'appstip-appointments'
									),
									value: 'confirmed',
								},
								{
									label: __(
										'Cancelled',
										'appstip-appointments'
									),
									value: 'cancelled',
								},
								{
									label: __(
										'No Show',
										'appstip-appointments'
									),
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
							label={__('Status', 'appstip-appointments')}
						/>
					</FormField>

					<FormFieldSet
						legend={__('Date and time', 'appstip-appointments')}
					>
						<ToggleControl
							onChange={(value) => {
								if (value) {
									// Switching to all-day: seed the start day
									// from any already-selected date/today so the
									// appointment still has a date, and drop the
									// clock time fields.
									const startDay = new Date(
										formData.date || defaultDateToday
									);
									setFormData((prev) => ({
										...prev,
										allDay: true,
										date: startDay.toISOString(),
										datetime: startDay.getTime().toString(),
										timeHourStart: '',
										timeMinuteStart: '',
									}));
								} else {
									setField('allDay', false);
								}
							}}
							checked={formData.allDay}
							label={__('All day', 'appstip-appointments')}
							__nextHasNoMarginBottom
						/>

						{formData.allDay ? (
							<FormFieldSet
								legend={__('Start day', 'appstip-appointments')}
								style={{ maxWidth: '300px' }}
							>
								<WPDatePicker
									currentDate={
										formData.date ||
										defaultDateToday.toISOString()
									}
									onChange={(newDate) => {
										if (newDate) {
											const start = new Date(newDate);
											setFormData((prev) => ({
												...prev,
												date: start.toISOString(),
												datetime: start
													.getTime()
													.toString(),
											}));
										}
									}}
									startOfWeek={
										window.wpappointments.date
											.startOfWeek as
											| 0
											| 1
											| 2
											| 3
											| 4
											| 5
											| 6
									}
									events={[]}
								/>
							</FormFieldSet>
						) : (
							<>
								<FormFieldSet
									horizontal
									horizontalCenter
									style={{
										display: formData.datetime
											? 'none'
											: 'block',
									}}
								>
									<span className={styles.noTimeLabel}>
										{__(
											'No time selected',
											'appstip-appointments'
										)}
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
										{__(
											'Select time',
											'appstip-appointments'
										)}
									</Button>
								</FormFieldSet>

								{formData.datetime && formData.date && (
									<Summary
										date={new Date(formData.date)}
										timeHourStart={formData.timeHourStart}
										timeMinuteStart={
											formData.timeMinuteStart
										}
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
												{__(
													'Change',
													'appstip-appointments'
												)}
											</Button>
										}
									/>
								)}
							</>
						)}

						<FormFieldSet
							legend={__('End date', 'appstip-appointments')}
							style={{ maxWidth: '300px' }}
						>
							<span className={styles.noTimeLabel}>
								{__(
									'Optional. Set to create a multi-day appointment.',
									'appstip-appointments'
								)}
							</span>
							{showEndDate || formData.endDate ? (
								<>
									<WPDatePicker
										currentDate={
											formData.endDate ||
											formData.date ||
											defaultDateToday.toISOString()
										}
										onChange={(newDate) => {
											if (newDate) {
												setField('endDate', newDate);
											}
										}}
										isInvalidDate={(d) => {
											if (!formData.date) {
												return false;
											}

											return isBefore(
												startOfDay(d),
												startOfDay(
													new Date(formData.date)
												)
											);
										}}
										startOfWeek={
											window.wpappointments.date
												.startOfWeek as
												| 0
												| 1
												| 2
												| 3
												| 4
												| 5
												| 6
										}
										events={[]}
									/>
									<Button
										size="small"
										variant="tertiary"
										isDestructive
										onClick={() => {
											setField('endDate', '');
											setShowEndDate(false);
										}}
									>
										{__(
											'Clear end date',
											'appstip-appointments'
										)}
									</Button>
								</>
							) : (
								<Button
									variant="secondary"
									size="small"
									onClick={() => setShowEndDate(true)}
								>
									{__('Add end date', 'appstip-appointments')}
								</Button>
							)}
						</FormFieldSet>
					</FormFieldSet>

					<FormFieldSet
						legend={__('Customer', 'appstip-appointments')}
						style={{
							display:
								selectedCustomer || defaultCustomer?.name
									? 'none'
									: 'block',
						}}
					>
						<FormFieldSet horizontal horizontalCenter>
							<span className={styles.noTimeLabel}>
								{__(
									'No customer selected',
									'appstip-appointments'
								)}
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
									{__(
										'Select customer',
										'appstip-appointments'
									)}
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
									{__('New customer', 'appstip-appointments')}
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
										{__('Change', 'appstip-appointments')}
									</Button>
									<Button
										size="small"
										variant="secondary"
										onClick={clearCustomer}
									>
										{__('Clear', 'appstip-appointments')}
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
						isBusy={isSubmitting}
						disabled={isSubmitting}
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
