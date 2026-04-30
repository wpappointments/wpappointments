import { useRef, useState } from 'react';
import {
	Button,
	CheckboxControl,
	Popover,
	ToggleControl,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, copy, plus, trash } from '@wordpress/icons';
import type {
	Day,
	DayOpeningHours,
} from '~/backend/store/settings/settings.types';
import ScheduleTimePicker from '../ScheduleTimePicker/ScheduleTimePicker';
import styles from './OpeningHoursDayOfWeek.module.css';

const DAY_LABELS: Record<Day, string> = {
	monday: __('Monday', 'appointments-booking'),
	tuesday: __('Tuesday', 'appointments-booking'),
	wednesday: __('Wednesday', 'appointments-booking'),
	thursday: __('Thursday', 'appointments-booking'),
	friday: __('Friday', 'appointments-booking'),
	saturday: __('Saturday', 'appointments-booking'),
	sunday: __('Sunday', 'appointments-booking'),
};

type Props = {
	day: Day;
	allDays: Day[];
	timePickerPrecision?: number;
	dayData: DayOpeningHours;
	onChange: (day: string, value: DayOpeningHours) => void;
};

export default function OpeningHoursDayOfWeek({
	day,
	allDays,
	timePickerPrecision,
	dayData,
	onChange,
}: Props) {
	const { enabled, allDay, slots } = dayData;
	const { list } = slots || { list: [] };

	// Stash slots when entering all-day so toggling back restores them.
	// useRef instead of useState — we don't want a re-render when stashing,
	// and the value only needs to live as long as the component is mounted
	// (toggling off→on within a session is the supported flow).
	const stashedSlotsRef = useRef<typeof list | null>(null);

	const update = (partial: Partial<DayOpeningHours>) => {
		onChange(day, { ...dayData, ...partial });
	};

	const handleTimeChange = ({
		value,
		index,
		type,
		time,
	}: {
		value: string;
		index: number;
		type: 'start' | 'end';
		time: 'hour' | 'minute';
	}) => {
		const newList = [...list];
		newList[index] = {
			...newList[index],
			[type]: { ...newList[index][type], [time]: value },
		};
		update({ slots: { list: newList } });
	};

	const handleAddSlot = () => {
		update({
			slots: {
				list: [
					...list,
					{
						start: { hour: '17', minute: '00' },
						end: { hour: '18', minute: '00' },
					},
				],
			},
		});
	};

	const handleRemoveSlot = (index: number) => {
		update({
			slots: {
				list: list.filter((_, i) => i !== index),
			},
		});
	};

	const handleToggleEnabled = (newEnabled: boolean) => {
		if (newEnabled) {
			const firstSlot = list[0];
			if (!firstSlot || !firstSlot.start?.hour || !firstSlot.end?.hour) {
				update({
					enabled: true,
					slots: {
						list: [
							{
								start: { hour: '09', minute: '00' },
								end: { hour: '17', minute: '00' },
							},
						],
					},
				});
				return;
			}
		} else {
			update({ enabled: false, allDay: false });
			return;
		}
		update({ enabled: newEnabled });
	};

	const handleToggleAllDay = () => {
		if (allDay) {
			const restored = stashedSlotsRef.current ?? [
				{
					start: { hour: '09', minute: '00' },
					end: { hour: '17', minute: '00' },
				},
			];
			stashedSlotsRef.current = null;
			update({
				allDay: false,
				slots: { list: restored },
			});
		} else {
			stashedSlotsRef.current = list;
			update({
				allDay: true,
				slots: {
					list: [
						{
							start: { hour: '00', minute: '00' },
							end: { hour: '24', minute: '00' },
						},
					],
				},
			});
		}
	};

	const handleCopyTo = (targetDays: Day[]) => {
		for (const d of targetDays) {
			if (d === day) continue;
			onChange(d, { ...dayData, day: d });
		}
	};

	return (
		<div className={styles.dayRow}>
			<div className={styles.dayHeader}>
				<ToggleControl
					onChange={handleToggleEnabled}
					checked={enabled}
					label={DAY_LABELS[day]}
					__nextHasNoMarginBottom
				/>
				<span className={styles.dayName} aria-hidden="true">
					{DAY_LABELS[day]}
				</span>
			</div>

			{enabled && (
				<div className={styles.slotsColumn}>
					{list.map((slot, index) => (
						<div key={index} className={styles.slotRow}>
							<div
								className={
									allDay
										? styles.timePickersDisabled
										: undefined
								}
							>
								<ScheduleTimePicker
									slot={slot}
									type="start"
									timePickerPrecision={timePickerPrecision}
									onTimeChange={(value, time) =>
										handleTimeChange({
											value,
											index,
											type: 'start',
											time,
										})
									}
								/>
							</div>
							<span className={styles.slotSeparator}>-</span>
							<div
								className={
									allDay
										? styles.timePickersDisabled
										: undefined
								}
							>
								<ScheduleTimePicker
									slot={slot}
									type="end"
									timePickerPrecision={timePickerPrecision}
									onTimeChange={(value, time) =>
										handleTimeChange({
											value,
											index,
											type: 'end',
											time,
										})
									}
									minHour={slot.start.hour}
									minMinute={slot.start.minute}
								/>
							</div>

							{index === 0 && (
								<div className={styles.slotActions}>
									{!allDay && (
										<Tooltip
											text={__(
												'Add new time slot',
												'appointments-booking'
											)}
										>
											<Button
												size="small"
												icon={plus}
												onClick={handleAddSlot}
												label={__(
													'Add new time slot',
													'appointments-booking'
												)}
											/>
										</Tooltip>
									)}
									<CopyTimesButton
										day={day}
										allDays={allDays}
										onCopy={handleCopyTo}
									/>
									<Tooltip
										text={
											allDay
												? __(
														'Unset all day',
														'appointments-booking'
													)
												: __(
														'Set all day',
														'appointments-booking'
													)
										}
									>
										<Button
											size="small"
											icon={backup}
											onClick={handleToggleAllDay}
											label={
												allDay
													? __(
															'Unset all day',
															'appointments-booking'
														)
													: __(
															'Set all day',
															'appointments-booking'
														)
											}
											style={{
												color: allDay
													? 'var(--wp-admin-theme-color)'
													: undefined,
											}}
										/>
									</Tooltip>
								</div>
							)}

							{index > 0 && (
								<div className={styles.slotActions}>
									<Tooltip
										text={__(
											'Remove time slot',
											'appointments-booking'
										)}
									>
										<Button
											size="small"
											icon={trash}
											isDestructive
											onClick={() =>
												handleRemoveSlot(index)
											}
											label={__(
												'Remove time slot',
												'appointments-booking'
											)}
										/>
									</Tooltip>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function CopyTimesButton({
	day,
	allDays,
	onCopy,
}: {
	day: Day;
	allDays: Day[];
	onCopy: (days: Day[]) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState<Set<Day>>(new Set([day]));

	const otherDays = allDays.filter((d) => d !== day);
	const allSelected = otherDays.every((d) => selected.has(d));

	const handleToggleDay = (d: Day) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(d)) {
				next.delete(d);
			} else {
				next.add(d);
			}
			return next;
		});
	};

	const handleToggleAll = () => {
		if (allSelected) {
			setSelected(new Set([day]));
		} else {
			setSelected(new Set(allDays));
		}
	};

	const handleApply = () => {
		onCopy(Array.from(selected));
		setIsOpen(false);
		setSelected(new Set([day]));
	};

	const handleCancel = () => {
		setIsOpen(false);
		setSelected(new Set([day]));
	};

	return (
		<>
			<Tooltip text={__('Copy times to', 'appointments-booking')}>
				<Button
					size="small"
					icon={copy}
					onClick={() => setIsOpen(!isOpen)}
					label={__('Copy times to', 'appointments-booking')}
				/>
			</Tooltip>
			{isOpen && (
				<Popover
					placement="bottom-start"
					onClose={() => setIsOpen(false)}
					className={styles.copyPopover}
				>
					<div className={styles.copyPopoverContent}>
						<div className={styles.copyPopoverHeader}>
							{__('COPY TIMES TO', 'appointments-booking')}
						</div>
						<div className={styles.copyPopoverList}>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__('Select all', 'appointments-booking')}
								checked={allSelected}
								onChange={handleToggleAll}
							/>
							{allDays.map((d) => (
								<CheckboxControl
									__nextHasNoMarginBottom
									key={d}
									label={DAY_LABELS[d]}
									checked={selected.has(d)}
									onChange={() => handleToggleDay(d)}
									disabled={d === day}
								/>
							))}
						</div>
						<div className={styles.copyPopoverFooter}>
							<Button variant="tertiary" onClick={handleCancel}>
								{__('Cancel', 'appointments-booking')}
							</Button>
							<Button variant="primary" onClick={handleApply}>
								{__('Apply', 'appointments-booking')}
							</Button>
						</div>
					</div>
				</Popover>
			)}
		</>
	);
}
