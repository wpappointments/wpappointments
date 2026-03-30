import { useState } from 'react';
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
	monday: __('Monday', 'wpappointments'),
	tuesday: __('Tuesday', 'wpappointments'),
	wednesday: __('Wednesday', 'wpappointments'),
	thursday: __('Thursday', 'wpappointments'),
	friday: __('Friday', 'wpappointments'),
	saturday: __('Saturday', 'wpappointments'),
	sunday: __('Sunday', 'wpappointments'),
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
			update({
				allDay: false,
				slots: {
					list: [
						{
							start: { hour: '09', minute: '00' },
							end: { hour: '17', minute: '00' },
						},
					],
				},
			});
		} else {
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
								/>
							</div>

							{index === 0 && (
								<div className={styles.slotActions}>
									{!allDay && (
										<Tooltip
											text={__(
												'Add new time slot',
												'wpappointments'
											)}
										>
											<Button
												size="small"
												icon={plus}
												onClick={handleAddSlot}
												label={__(
													'Add new time slot',
													'wpappointments'
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
														'wpappointments'
													)
												: __(
														'Set all day',
														'wpappointments'
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
															'wpappointments'
														)
													: __(
															'Set all day',
															'wpappointments'
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
											'wpappointments'
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
												'wpappointments'
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
			<Tooltip text={__('Copy times to', 'wpappointments')}>
				<Button
					size="small"
					icon={copy}
					onClick={() => setIsOpen(!isOpen)}
					label={__('Copy times to', 'wpappointments')}
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
							{__('COPY TIMES TO', 'wpappointments')}
						</div>
						<div className={styles.copyPopoverList}>
							<CheckboxControl
								__nextHasNoMarginBottom
								label={__('Select all', 'wpappointments')}
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
								{__('Cancel', 'wpappointments')}
							</Button>
							<Button variant="primary" onClick={handleApply}>
								{__('Apply', 'wpappointments')}
							</Button>
						</div>
					</div>
				</Popover>
			)}
		</>
	);
}
