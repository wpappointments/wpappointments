import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
	Button,
	CheckboxControl,
	Popover,
	Tooltip,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup, copy, plus, trash } from '@wordpress/icons';
import { Toggle } from '@wpappointments/components';
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
};

export default function OpeningHoursDayOfWeek({
	day,
	allDays,
	timePickerPrecision,
}: Props) {
	const { setValue, getValues, watch } = useFormContext();

	const dayData: DayOpeningHours = watch(day) || getDefaultDay(day);
	const { enabled, allDay, slots } = dayData;
	const { list } = slots || { list: [] };

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
		setValue(`${day}.slots.list.${index}.${type}.${time}`, value);
	};

	const handleAddSlot = () => {
		const current = getValues(`${day}.slots.list`) || [];
		setValue(`${day}.slots.list`, [
			...current,
			{
				start: { hour: '17', minute: '00' },
				end: { hour: '18', minute: '00' },
			},
		]);
	};

	const handleRemoveSlot = (index: number) => {
		const current = getValues(`${day}.slots.list`) || [];
		setValue(
			`${day}.slots.list`,
			current.filter((_: unknown, i: number) => i !== index)
		);
	};

	const handleToggleAllDay = () => {
		if (allDay) {
			setValue(`${day}.allDay`, false);
			setValue(`${day}.slots.list`, [
				{
					start: { hour: '09', minute: '00' },
					end: { hour: '17', minute: '00' },
				},
			]);
		} else {
			setValue(`${day}.allDay`, true);
			setValue(`${day}.slots.list`, [
				{
					start: { hour: '00', minute: '00' },
					end: { hour: '24', minute: '00' },
				},
			]);
		}
	};

	const handleCopyTo = (targetDays: Day[]) => {
		for (const d of targetDays) {
			if (d === day) continue;
			setValue(d, { ...dayData, day: d });
		}
	};

	return (
		<div className={styles.dayRow}>
			<div className={styles.dayHeader}>
				<Toggle
					name={`${day}.enabled`}
					onChange={(newEnabled) => {
						if (newEnabled) {
							const currentSlots =
								getValues(`${day}.slots.list`) || [];
							const firstSlot = currentSlots[0];

							if (
								!firstSlot ||
								!firstSlot.start?.hour ||
								!firstSlot.end?.hour
							) {
								setValue(`${day}.slots.list`, [
									{
										start: {
											hour: '09',
											minute: '00',
										},
										end: {
											hour: '17',
											minute: '00',
										},
									},
								]);
							}
						} else {
							setValue(`${day}.allDay`, false);
						}
					}}
					defaultChecked={enabled}
				/>
				<span className={styles.dayName}>{DAY_LABELS[day]}</span>
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
									day={day}
									index={index}
									type="start"
									timePickerPrecision={timePickerPrecision}
									onTimeChange={handleTimeChange}
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
									day={day}
									index={index}
									type="end"
									timePickerPrecision={timePickerPrecision}
									onTimeChange={handleTimeChange}
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

function getDefaultDay(day: Day): DayOpeningHours {
	return {
		day,
		enabled: false,
		allDay: false,
		slots: {
			list: [
				{
					start: { hour: '09', minute: '00' },
					end: { hour: '17', minute: '00' },
				},
			],
		},
	};
}
