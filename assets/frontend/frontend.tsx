import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { addDays, addYears, format } from 'date-fns';
import { Day, useLilius } from 'use-lilius';
import { Output, array, boolean, date, number, object, optional, safeParse, string, union } from 'valibot';
import cn from '~/backend/utils/cn';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { Customer } from '~/backend/store/customers/customers.types';
import { Appointment } from '~/backend/types';
import styles from './index.module.css';

export const DaySlotSchema = object({
	available: boolean(),
	dateString: string(),
	timestamp: number(),
	date: optional(date()),
	time: optional(string()),
});

export const DaySchema = object({
	available: boolean(),
	date: string(),
	day: array(DaySlotSchema),
});

export const AvailabilityResponseSchema = object({
	type: union([string('success'), string('error')]),
	data: object({
		availability: array(array(DaySchema)),
	}),
});

export type DaySlot = Output<typeof DaySlotSchema>;
export type DayCalendar = Output<typeof DaySchema>;
export type AvailabilityResponse = Output<typeof AvailabilityResponseSchema>;

type Fields = {
	datetime: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	account: boolean;
	password?: string;
	tos: boolean;
};

type Response = APIResponse<{
	appointment: Appointment;
	message: string;
}>;

export default function BookingFlow() {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm<Fields>();

	const {
		calendar,
		inRange,
		isSelected,
		selected,
		select,
		viewing,
		viewNextMonth,
		viewPreviousMonth,
	} = useLilius({
		weekStartsOn: Day.MONDAY,
	});

	const [calendarWithAvailability, setCalendarWithAvailability] = useState<
		[AvailabilityResponse['data']['availability']] | []
	>([]);
	const [dayAvailability, setDayAvailability] = useState<
		DayCalendar['day'] | []
	>([]);

	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<boolean>(false);

	const onSubmit = async (data: Fields) => {
		const customer: Customer = {
			name: `${data.firstName} ${data.lastName}`,
			email: data.email,
			phone: data.phone,
		};

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'appointment-public',
				method: 'POST',
				data: {
					customer,
					date: data.datetime,
					createAccount: data.account,
					password: data.password,
				},
			});

			return response;
		});

		if (error) {
			setFormError('Error creating appointment');
		}

		if (response) {
			if (response.type === 'success') {
				setFormSuccess(true);
			}

			if (response.type === 'error' && response.message) {
				setFormError(response.message);
			}
		}
	};

	const account = watch('account');
	const datetime = watch('datetime');

	const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const currentMonth = format(viewing, 'LLLL');
	const currentYear = viewing.getFullYear();

	useEffect(() => {
		if (
			!calendarWithAvailability ||
			calendarWithAvailability.length === 0
		) {
			return;
		}

		const availability = findDayAvailability(
			selected[0],
			calendarWithAvailability
		);

		setDayAvailability(availability);
	}, [selected]);

	useEffect(() => {
		apiFetch({
			path: addQueryArgs('calendar-availability-v2', {
				calendar: JSON.stringify(calendar[0]),
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			}),
		}).then((data) => {
			const parsed = safeParse(AvailabilityResponseSchema, data);
			const { output, success } = parsed;

			if (!success) {
				console.error('Failed to parse availability response', parsed);
				return;
			}

			const { data: response } = output;
			const { availability } = response;

			setCalendarWithAvailability([availability]);
		}).catch((error) => {
			console.error('Failed to fetch availability', error);
		});
	}, [viewing.getMonth()]);

	return (
		<div className={styles.bookingFlow}>
			{formError && <p className={styles.error}>{formError}</p>}
			{formSuccess && (
				<p className={styles.success}>
					✅{' '}
					{__('Appointment created successfully', 'wpappointments')}
				</p>
			)}
			{!formSuccess && (
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="steps">
						<div className={styles.step}>
							<h2>
								{__('Select date and time', 'wpappointments')}
							</h2>
							<div className={styles.calendar}>
								<div className={styles.calendarControls}>
									<button
										onClick={viewPreviousMonth}
										type="button"
										disabled={
											viewing.getMonth() ===
												new Date().getMonth() &&
											viewing.getFullYear() ===
												new Date().getFullYear()
										}
										className={styles.calendarControlButton}
									>
										<Icon icon={chevronLeft} />
									</button>
									<h5 className={styles.calendarMonthHeader}>
										{currentMonth} {currentYear}
									</h5>
									<button
										onClick={viewNextMonth}
										type="button"
										className={styles.calendarControlButton}
									>
										<Icon icon={chevronRight} />
									</button>
								</div>
								<div className={styles.calendarHeader}>
									{week.map((day, i) => (
										<div
											key={i}
											className={styles.calendarHeaderDay}
										>
											{day}
										</div>
									))}
								</div>
								{calendarWithAvailability &&
									calendarWithAvailability.map((month, i) => (
										<div key={i}>
											{month.map((week, j) => (
												<div
													className={
														styles.calendarRow
													}
													key={`week-${j}`}
												>
													{week.map((day, k) => {
														const d = new Date(
															day.date
														);

														return (
															<button
																key={`day-${k}`}
																onClick={() => {
																	select(
																		d,
																		true
																	);
																}}
																className={cn({
																	[styles.calendarDay]:
																		true,
																	[styles.calendarDaySelected]:
																		isSelected(
																			d
																		),
																	[styles.calendarDayInCurrentMonth]:
																		d.getMonth() ===
																		viewing.getMonth(),
																	[styles.calendarDayUnavailable]:
																		!day.available,
																})}
																type="button"
																disabled={
																	!inRange(
																		d,
																		addDays(
																			new Date(),
																			-1
																		),
																		addYears(
																			new Date(),
																			500
																		)
																	) ||
																	!day.available
																}
															>
																{d.getDate()}
																{inRange(
																	d,
																	addDays(
																		new Date(),
																		-1
																	),
																	addYears(
																		new Date(),
																		500
																	)
																) &&
																	day.available && (
																		<span
																			className={
																				styles.calendarDayAvailability
																			}
																		></span>
																	)}
															</button>
														);
													})}
												</div>
											))}
										</div>
									))}
							</div>
							{selected && selected[0] && dayAvailability && (
								<>
									<h5 className={styles.timeSlotHeader}>
										{__(
											'Select a time slot for',
											'wpappointments'
										)}{' '}
										{format(selected[0], 'LLLL do')}
									</h5>
									<div className={styles.daySlots}>
										{dayAvailability.map((slot, i) => (
											<button
												key={i}
												onClick={() => {
													setValue(
														'datetime',
														new Date(
															slot.timestamp
														).toISOString()
													);
													clearErrors('datetime');
												}}
												type="button"
												className={cn({
													[styles.daySlot]: true,
													[styles.daySlotAvailable]:
														slot.available,
												})}
												data-time={slot.time}
											></button>
										))}
									</div>
									{datetime && (
										<div>
											<strong>Selected time:</strong>{' '}
											<span>
												{format(
													new Date(datetime),
													'LLLL do, HH:mm'
												)}
											</span>
										</div>
									)}
								</>
							)}
							<div>
								<input
									type="hidden"
									{...register('datetime', {
										required: true,
									})}
								/>
								{errors.datetime && (
									<p className={styles.error}>
										{__(
											'Please select a date and time',
											'wpappointments'
										)}
									</p>
								)}
							</div>
						</div>
						<div className={styles.step}>
							<h2>
								{__('Customer information', 'wpappointments')}
							</h2>
							<div className={styles.field}>
								<input
									type="text"
									placeholder={__(
										'First name',
										'wpappointments'
									)}
									className={styles.input}
									{...register('firstName', {
										required: true,
									})}
								/>
								{errors.firstName && (
									<p className={styles.error}>
										{__(
											'First name is required',
											'wpappointments'
										)}
									</p>
								)}
							</div>
							<div className={styles.field}>
								<input
									type="text"
									placeholder={__(
										'Last name',
										'wpappointments'
									)}
									className={styles.input}
									{...register('lastName', {
										required: true,
									})}
								/>
								{errors.lastName && (
									<p className={styles.error}>
										{__(
											'Last name is required',
											'wpappointments'
										)}
									</p>
								)}
							</div>
							<div className={styles.field}>
								<input
									type="email"
									placeholder={__('Email', 'wpappointments')}
									className={styles.input}
									{...register('email', {
										required: true,
									})}
								/>
								{errors.email && (
									<p className={styles.error}>
										{__(
											'Email is required',
											'wpappointments'
										)}
									</p>
								)}
							</div>
							<div className={styles.field}>
								<input
									type="tel"
									placeholder={__('Phone', 'wpappointments')}
									className={styles.input}
									{...register('phone', {
										required: true,
									})}
								/>
								{errors.phone && (
									<p className={styles.error}>
										{__(
											'Phone is required',
											'wpappointments'
										)}
									</p>
								)}
							</div>
							<div className={styles.field}>
								<label className={styles.checkboxLabel}>
									<input
										type="checkbox"
										className={styles.checkbox}
										{...register('account')}
									/>
									{__('Create account', 'wpappointments')}
								</label>
							</div>
							{account && (
								<div className={styles.field}>
									<input
										type="password"
										placeholder={__(
											'Password (optional)',
											'wpappointments'
										)}
										className={styles.input}
										{...register('password')}
									/>
									<small>
										{__(
											'When left blank, password will be generated automatically',
											'wpappointments'
										)}
									</small>
								</div>
							)}
							<div className={styles.field}>
								<label className={styles.checkboxLabel}>
									<input
										type="checkbox"
										className={styles.checkbox}
										{...register('tos')}
									/>
									{__(
										'I agree to terms and conditions',
										'wpappointments'
									)}
								</label>
							</div>
						</div>
					</div>

					<input
						type="submit"
						value="Book"
						className={cn({
							'wp-block-button__link': true,
							'wp-block-button': true,
							[styles.submitButton]: true,
						})}
					/>
				</form>
			)}
		</div>
	);
}

function findDayAvailability(
	dayDate: Date,
	months: [AvailabilityResponse['data']['availability']]
) {
	if (!months || !months.length || !dayDate) {
		return [];
	}

	for (const month of months) {
		for (const week of month) {
			for (const day of week) {
				const d = new Date(day.date);

				if (d.getTime() === dayDate.getTime()) {
					return day.day.map((slot) => {
						return {
							date: new Date(slot.timestamp),
							time: format(new Date(slot.timestamp), 'HH:mm'),
							available: slot.available,
							timestamp: slot.timestamp,
							dateString: slot.dateString,
						};
					});
				}
			}
		}
	}

	return [];
}