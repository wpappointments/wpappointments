import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { addDays, addMinutes, addYears, format } from 'date-fns';
import { useLilius } from 'use-lilius';
import cn from '~/backend/utils/cn';
import apiFetch from '~/backend/utils/fetch';
import styles from './index.module.css';


export default function BookingFlow() {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		clearErrors,
		formState: { errors },
	} = useForm();

	const {
		calendar,
		inRange,
		isSelected,
		selected,
		select,
		viewing,
		viewNextMonth,
		viewPreviousMonth,
	} = useLilius();

	console.log(calendar);

	const [calendarWithAvailability, setCalendarWithAvailability] = useState([]);

	const onSubmit = (data: any) => {
		console.log(data);
	};

	useEffect(() => {
		if (!calendar.length) {
			return;
		}

		const firstDay = calendar[0][0][0];
		const lastDay = calendar[0][calendar[0].length - 1][6];

		console.log(firstDay, lastDay);
		console.log(firstDay.getTime() / 1000, lastDay.getTime() / 1000);

		apiFetch({
			path: addQueryArgs('calendar-availability', {
				firstDay: Math.floor(firstDay.getTime() / 1000),
				lastDay: Math.floor(lastDay.getTime() / 1000),
			}),
		})
			.then((data) => {
				console.log(data);
				setCalendarWithAvailability(data.data);
			})
			.catch((error) => {
				console.error(error);
			});
	}, [viewing.getMonth()]);

	// useEffect(() => {
	// 	apiFetch({
	// 		path: addQueryArgs('availability', {
	// 			currentMonth: viewing.getMonth() + 1,
	// 			currentYear: viewing.getFullYear(),
	// 		}),
	// 	})
	// 		.then((data) => {
	// 			// console.log(data);
	// 			const slots = [];
	// 			for (const day of data.data.availability.month[
	// 				viewing.getDate() - 1
	// 			].slots) {
	// 				if (!day.available) {
	// 					if (slots.length) {
	// 						break;
	// 					}
	// 					continue;
	// 				}

	// 				slots.push(day);
	// 			}
	// 			setDayAvailability(slots);
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 		});
	// }, [viewing.getDate()]);

	// console.log(dayAvailability);

	const account = watch('account');

	const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const currentMonth = format(viewing, 'LLLL');
	const currentYear = viewing.getFullYear();

	const daySlots = [];
	const dayMidnight = new Date();
	dayMidnight.setHours(0, 0, 0, 0);

	for (let i = 0; i < 1440; i += 30) {
		const slotDate = addMinutes(dayMidnight, i);
		daySlots.push(slotDate);
	}

	// console.log(daySlots);
	
	return (
		<div className={styles.bookingFlow}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="steps">
					<div className="step1">
						<h2>{__('Select date and time', 'wpappointments')}</h2>
						<div className={styles.calendar}>
							<div className={styles.calendarControls}>
								<button
									onClick={viewPreviousMonth}
									type="button"
									disabled={
										viewing.getMonth() === new Date().getMonth() &&
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
								<button onClick={viewNextMonth} type="button"
									className={styles.calendarControlButton}>
									<Icon icon={chevronRight} />
								</button>
							</div>
							<div className={styles.calendarHeader}>
								{week.map((day, i) => (
									<div key={i} className={styles.calendarHeaderDay}>
										{day}
									</div>
								))}
							</div>
							{calendarWithAvailability && [calendarWithAvailability].map((month, i) => (
								<div key={i}>
									{month.map((week, j) => (
										<div
											className={styles.calendarRow}
											key={`week-${j}`}
										>
											{/* {JSON.stringify(day)} */}
											{week.map((day, k) => {
												const d = new Date(day.date);
												const availability = day.availability;

												return (
													<button
														key={`day-${k}`}
														onClick={() => {
															select(d, true);
															console.log(selected);
														}}
														className={cn({
															[styles.calendarDay]: true,
															[styles.calendarDaySelected]:
																isSelected(d),
															[styles.calendarDayInCurrentMonth]:
																d.getMonth() ===
																viewing.getMonth(),
														})}
														type="button"
														disabled={
															!inRange(
																d,
																addDays(new Date(), -1),
																addYears(new Date(), 500)
															)
														}
													>
														{d.getDate()}
														{inRange(
															d,
															addDays(new Date(), -1),
															addYears(new Date(), 500)
														) && (
															<span
																className={
																	styles.calendarDayAvailability
																}
															></span>
														)}
													</button>
												)
											})}
										</div>
									))}
								</div>
							))}
						</div>
						{selected && selected[0] && (
							<>
								<h5 className={styles.timeSlotHeader}>
									{__('Select a time slot for', 'wpappointments')} {format(selected[0], 'LLLL do')}
								</h5>
								<div className={styles.daySlots}>
									{daySlots.map((slot, i) => (
										<button
											key={i}
											onClick={() => {
												setValue('datetime', slot.getTime());
												clearErrors('datetime');
											}}
											type="button"
											className={styles.daySlot}
											data-time={format(slot, 'p')}
										>
										</button>
									))}
								</div>
								
							</>
						)}
						<div>
							<input type="hidden" {...register('datetime', {
								required: true,
							})} />
							{errors.datetime && (
								<p className={styles.error}>{__('Please select a date and time', 'wpappointments')}</p>
							)}
						</div>
					</div>
					<div className="step2">
						<h2>{__('Customer information', 'wpappointments')}</h2>
						<div>
							<input
								type="text"
								placeholder={__('First name', 'wpappointments')}
								className={styles.input}
								{...register('firstName', {
									required: true,
								})}
							/>
							{errors.firstName && (
								<p className={styles.error}>{__('First name is required', 'wpappointments')}</p>
							)}
						</div>
						<div>
							<input
								type="text"
								placeholder={__('Last name', 'wpappointments')}
								className={styles.input}
								{...register('lastName', {
									required: true,
								})}
							/>
							{errors.lastName && (
								<p className={styles.error}>{__('Last name is required', 'wpappointments')}</p>
							)}
						</div>
						<div>
							<input
								type="email"
								placeholder={__('Email', 'wpappointments')}
								className={styles.input}
								{...register('email', {
									required: true,
								})}
							/>
							{errors.email && (
								<p className={styles.error}>{__('Email is required', 'wpappointments')}</p>
							)}
						</div>
						<div>
							<input
								type="tel"
								placeholder={__('Phone', 'wpappointments')}
								className={styles.input}
								{...register('phone', {
									required: true,
								})}
							/>
							{errors.phone && (
								<p className={styles.error}>{__('Phone is required', 'wpappointments')}</p>
							)}
						</div>
						<div>
							<label className={styles.checkboxLabel}>
								<input
									type="checkbox"
									className={styles.checkbox}
									{...register('account')}
								/>
								{__('Create account', 'wpappointments')}
							</label>
							{errors.phone && (
								<p className={styles.error}>{__('Phone is required', 'wpappointments')}</p>
							)}
						</div>
						{account && (
							<div>
								<input
									type="password"
									placeholder={__('Password (optional)', 'wpappointments')}
									className={styles.input}
									{...register('password')}
								/>
								{errors.phone && (
									<p className={styles.error}>{__('Phone is required', 'wpappointments')}</p>
								)}
							</div>
						)}
					</div>
				</div>
				
				<input
					type="submit"
					value="Book"
					className={cn({
						'wp-block-button__link': true,
						'wp-block-button': true,
					})}
				/>
			</form>
		</div>
	);
}