import { __ } from '@wordpress/i18n';
import { addDays, addMinutes, addYears, format } from 'date-fns';
import cn from 'obj-str';
import { formatTime } from '~/backend/utils/i18n';
import styles from './BookingFlowCalendar.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowCalendar() {
	const {
		lilius,
		form,
		calendarWithAvailability,
		dayAvailability,
		dayNotices,
		attributes,
		weekDays,
		availabilityLoading,
	} = useBookingFlowContext();

	const {
		selected,
		inRange,
		isSelected,
		select,
		viewing,
		viewNextMonth,
		viewPreviousMonth,
	} = lilius;

	const {
		setValue,
		clearErrors,
		register,
		watch,
		formState: { errors },
	} = form;

	const { alignment, slotsAsButtons } = attributes;
	const { settings } = window.wpappointments;
	const defaultLength = settings?.appointments?.defaultLength || 30;

	const datetime = watch('datetime');
	const currentMonth = format(viewing, 'LLLL');
	const currentYear = viewing.getFullYear();

	return (
		<>
			<div className={styles.calendar}>
				<div className={styles.calendarControls}>
					<button
						onClick={viewPreviousMonth}
						type="button"
						disabled={
							viewing.getMonth() === new Date().getMonth() &&
							viewing.getFullYear() === new Date().getFullYear()
						}
						className={styles.calendarControlButton}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							aria-hidden="true"
						>
							<path d="M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z" />
						</svg>
					</button>
					<h5 className={styles.calendarMonthHeader}>
						{currentMonth} {currentYear}
					</h5>
					<button
						onClick={viewNextMonth}
						type="button"
						className={styles.calendarControlButton}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							aria-hidden="true"
						>
							<path d="M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1L16 12z" />
						</svg>
					</button>
				</div>
				<div className={styles.calendarHeader}>
					{weekDays.map((day, i) => (
						<div key={i} className={styles.calendarHeaderDay}>
							{day.label}
						</div>
					))}
				</div>
				{availabilityLoading && (
					<div>
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className={styles.calendarRow}>
								{Array.from({ length: 7 }).map((_, j) => (
									<button
										key={j}
										disabled={true}
										className={styles.calendarDay}
									></button>
								))}
							</div>
						))}
					</div>
				)}
				{calendarWithAvailability &&
					!availabilityLoading &&
					calendarWithAvailability.map((month, i) => (
						<div key={i}>
							{month.map((week, j) => (
								<div
									className={styles.calendarRow}
									key={`week-${j}`}
								>
									{week.map((day, k) => {
										const d = new Date(day.date);
										const dateKey = day.date
											? day.date.split('T')[0]
											: '';
										const notices =
											dayNotices[dateKey] || [];
										const totalSlots = day.totalSlots || 0;
										const totalAvailable =
											day.totalAvailable || 0;
										const percentage =
											(totalAvailable / totalSlots) * 100;

										let threshold:
											| 'High'
											| 'Medium'
											| 'Low'
											| 'Limited' = 'High';

										if (percentage < 50) {
											threshold = 'Medium';
										}

										if (percentage < 30) {
											threshold = 'Low';
										}

										if (
											percentage < 15 ||
											totalAvailable === 1
										) {
											threshold = 'Limited';
										}

										return (
											<button
												key={`day-${k}`}
												onClick={() => {
													if (notices.length > 0) {
														select(d, true);
														return;
													}

													if (!day.available) {
														return;
													}

													select(d, true);
												}}
												title={
													notices.length > 0
														? notices
																.map(
																	(n) =>
																		n.note ||
																		''
																)
																.filter(Boolean)
																.join(', ')
														: undefined
												}
												className={cn({
													[styles.calendarDay]: true,
													[styles.calendarDaySelected]:
														isSelected(d),
													[styles.calendarDayInCurrentMonth]:
														d.getMonth() ===
														viewing.getMonth(),
													[styles.calendarDayUnavailable]:
														!day.available,
													[styles.calendarDayHasNotice]:
														notices.length > 0,
													[styles[
														`calendarDayThreshold${threshold}`
													]]: true,
												})}
												type="button"
												disabled={
													!inRange(
														d,
														addDays(new Date(), -1),
														addYears(
															new Date(),
															500
														)
													) ||
													(!day.available &&
														notices.length === 0)
												}
											>
												{d.getDate()}
												{inRange(
													d,
													addDays(new Date(), -1),
													addYears(new Date(), 500)
												) &&
													day.available && (
														<span
															className={
																styles.calendarDayAvailability
															}
														>
															<span
																style={{
																	width: `${percentage}%`,
																}}
															></span>
														</span>
													)}
												{notices.length > 0 && (
													<span
														className={
															styles.calendarDayNoticeIndicator
														}
													/>
												)}
											</button>
										);
									})}
								</div>
							))}
						</div>
					))}
			</div>
			{selected &&
				selected[0] &&
				(() => {
					const selectedDateKey = format(selected[0], 'yyyy-MM-dd');
					const selectedNotices = dayNotices[selectedDateKey] || [];
					const hasNotices = selectedNotices.length > 0;

					if (hasNotices) {
						return (
							<div className={styles.noticePanel}>
								<h5 className={styles.timeSlotHeader}>
									{format(selected[0], 'LLLL do')}
								</h5>
								{selectedNotices.map((notice, i) => (
									<div key={i} className={styles.noticeItem}>
										{notice.type === 'ooo' && (
											<span
												className={styles.noticeBadge}
											>
												{__(
													'Out of Office',
													'wpappointments'
												)}
											</span>
										)}
										{notice.type === 'holiday' && (
											<span
												className={
													styles.noticeBadgeHoliday
												}
											>
												{__(
													'Holiday',
													'wpappointments'
												)}
											</span>
										)}
										{notice.note && (
											<p className={styles.noticeText}>
												{notice.note}
											</p>
										)}
									</div>
								))}
							</div>
						);
					}

					return null;
				})()}
			{selected &&
				selected[0] &&
				dayAvailability &&
				!dayNotices[format(selected[0], 'yyyy-MM-dd')]?.length && (
					<>
						<h5 className={styles.timeSlotHeader}>
							{__('Select a time slot for', 'wpappointments')}{' '}
							{format(selected[0], 'LLLL do')}
						</h5>
						<div
							className={cn({
								[styles.daySlots]: true,
								[styles.center]: alignment === 'Center',
								[styles.right]: alignment === 'Right',
								[styles.buttonGroup]: slotsAsButtons,
							})}
						>
							{dayAvailability.map((slot, i) => (
								<button
									key={i}
									onClick={() => {
										if (!slot.available) {
											return;
										}

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
										[styles.isButton]: slotsAsButtons,
										[styles.daySlotAvailable]:
											slot.available,
										[styles.daySlotSelected]:
											datetime &&
											new Date(
												slot.timestamp
											).toISOString() === datetime,
									})}
									data-time={slot.time}
								>
									{slotsAsButtons && (
										<>
											{slot.time} -{' '}
											{formatTime(
												addMinutes(
													slot.timestamp,
													defaultLength
												)
											)}
										</>
									)}
								</button>
							))}
						</div>
						{datetime && (
							<div>
								<span>
									{__('Selected time:', 'wpappointments')}
								</span>{' '}
								<strong>
									{format(
										new Date(datetime),
										'LLLL do, HH:mm'
									)}
								</strong>
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
						{__('Please select a date and time', 'wpappointments')}
					</p>
				)}
			</div>
		</>
	);
}
