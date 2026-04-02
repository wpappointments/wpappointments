import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Tooltip } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { plus, trash } from '@wordpress/icons';
import { MultiDatePicker, Toggle, withForm } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { format as formatDate, startOfDay } from 'date-fns';
import type { OverrideGroup } from '~/backend/store/schedules/schedules.types';
import type { OpeningHoursSlot } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import styles from './DateOverrides.module.css';

function useClockType(): '12' | '24' {
	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const raw: string = generalSettings?.clockType || '24';
	return raw.startsWith('12') ? '12' : '24';
}

function formatSlotSummary(
	slot: OpeningHoursSlot,
	clockType: '12' | '24'
): string {
	const startH = slot.start.hour || '00';
	const startM = slot.start.minute || '00';
	const endH = slot.end.hour || '00';
	const endM = slot.end.minute || '00';

	if (clockType === '12') {
		const fmt = (h: string, m: string) => {
			const hour = parseInt(h);
			const suffix = hour >= 12 && hour < 24 ? 'pm' : 'am';
			const display =
				hour === 0 || hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
			return `${display}:${m}${suffix}`;
		};
		return `${fmt(startH, startM)} - ${fmt(endH, endM)}`;
	}

	return `${startH}:${startM} - ${endH}:${endM}`;
}

function formatDateList(dates: string[]): string {
	const sorted = [...dates].sort();

	if (sorted.length <= 3) {
		return sorted.join(', ');
	}

	return `${sorted.slice(0, 2).join(', ')} +${sorted.length - 2} more`;
}

function generateId(): string {
	return Math.random().toString(36).substring(2, 10);
}

// --- Override Editor (nested slideout) ---

type OverrideEditorProps = {
	slideoutId: string;
	group?: OverrideGroup;
	onSave: (group: OverrideGroup) => void;
};

const OverrideEditor = withForm(function OverrideEditor({
	slideoutId,
	group,
	onSave,
}: OverrideEditorProps) {
	const { closeSlideOut } = useSlideout();

	const [selectedDates, setSelectedDates] = useState<Date[]>(() =>
		group
			? group.dates.map((d) => {
					const [y, m, day] = d.split('-').map(Number);
					return startOfDay(new Date(y, m - 1, day));
				})
			: []
	);

	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);
	const startOfWeekSetting = generalSettings?.startOfWeek ?? 1;

	const [isClosed, setIsClosed] = useState(group?.type === 'closed');
	const [slots, setSlots] = useState<OpeningHoursSlot[]>(
		group?.type === 'custom' && group.slots.length > 0
			? group.slots
			: [
					{
						start: { hour: '09', minute: '00' },
						end: { hour: '17', minute: '00' },
					},
				]
	);

	const timePickerPrecision = useSelect(() => {
		return select(store).getAppointmentsSettings()?.timePickerPrecision;
	}, []);
	const clockType = useClockType();

	const handleSlotChange = (
		index: number,
		type: 'start' | 'end',
		time: 'hour' | 'minute',
		value: string
	) => {
		setSlots((prev) => {
			const next = [...prev];
			next[index] = {
				...next[index],
				[type]: { ...next[index][type], [time]: value },
			};
			return next;
		});
	};

	const handleAddSlot = () => {
		setSlots((prev) => [
			...prev,
			{
				start: { hour: '17', minute: '00' },
				end: { hour: '18', minute: '00' },
			},
		]);
	};

	const handleRemoveSlot = (index: number) => {
		setSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = () => {
		if (selectedDates.length === 0) return;

		const dateStrings = selectedDates
			.map((d) => formatDate(d, 'yyyy-MM-dd'))
			.sort();

		onSave({
			id: group?.id || generateId(),
			dates: dateStrings,
			type: isClosed ? 'closed' : 'custom',
			slots: isClosed ? [] : slots,
		});
		closeSlideOut(slideoutId);
	};

	return (
		<div className={styles.editorContent}>
			<div className={styles.calendarSection}>
				<p className={styles.sectionLabel}>
					{__('Select dates', 'wpappointments')}
				</p>
				<MultiDatePicker
					selectedDates={selectedDates}
					onChange={setSelectedDates}
					startOfWeek={
						startOfWeekSetting as 0 | 1 | 2 | 3 | 4 | 5 | 6
					}
				/>
			</div>

			<div className={styles.closedSection}>
				<Toggle
					name="_override_closed"
					defaultChecked={isClosed}
					onChange={(val) => setIsClosed(val)}
				/>
				<span className={styles.closedLabel}>
					{__('Mark unavailable (all day)', 'wpappointments')}
				</span>
			</div>

			{!isClosed && (
				<div className={styles.slotsSection}>
					<p className={styles.sectionLabel}>
						{__('Custom hours', 'wpappointments')}
					</p>
					{slots.map((slot, index) => (
						<div key={index} className={styles.slotRow}>
							<SlotTimePicker
								slot={slot}
								index={index}
								clockType={clockType}
								timePickerPrecision={timePickerPrecision}
								onChange={handleSlotChange}
							/>
							<div className={styles.slotActions}>
								{index === 0 && (
									<Tooltip
										text={__(
											'Add time slot',
											'wpappointments'
										)}
									>
										<Button
											size="small"
											icon={plus}
											onClick={handleAddSlot}
											label={__(
												'Add time slot',
												'wpappointments'
											)}
										/>
									</Tooltip>
								)}
								{index > 0 && (
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
								)}
							</div>
						</div>
					))}
				</div>
			)}

			<Button
				variant="primary"
				onClick={handleSave}
				disabled={selectedDates.length === 0}
				style={{
					width: '100%',
					justifyContent: 'center',
					padding: '22px 0px',
					marginTop: '16px',
				}}
			>
				{group
					? __('Update override', 'wpappointments')
					: __('Add override', 'wpappointments')}
			</Button>
		</div>
	);
});

// --- Slot Time Picker (standalone, no form context) ---

function SlotTimePicker({
	slot,
	index,
	clockType,
	timePickerPrecision,
	onChange,
}: {
	slot: OpeningHoursSlot;
	index: number;
	clockType: '12' | '24';
	timePickerPrecision?: number;
	onChange: (
		index: number,
		type: 'start' | 'end',
		time: 'hour' | 'minute',
		value: string
	) => void;
}) {
	const precision = timePickerPrecision || 60;
	const startOptions = createHourOptions(precision, clockType, '0', false);
	const endOptions = createHourOptions(
		precision,
		clockType,
		slot.start.hour || '0',
		true
	);

	const startHour = slot.start.hour || '09';
	const startMinutes =
		startOptions.find((o) => o.value === startHour)?.minutes || [];
	const endHour = slot.end.hour || '17';
	const endMinutes =
		endOptions.find((o) => o.value === endHour)?.minutes || [];

	return (
		<div className={styles.timePickerRow}>
			<select
				className={styles.timeSelect}
				value={startHour}
				onChange={(e) =>
					onChange(index, 'start', 'hour', e.target.value)
				}
			>
				{startOptions.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<span>:</span>
			<select
				className={styles.timeSelect}
				value={slot.start.minute || '00'}
				onChange={(e) =>
					onChange(index, 'start', 'minute', e.target.value)
				}
			>
				{startMinutes.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<span className={styles.separator}>-</span>
			<select
				className={styles.timeSelect}
				value={endHour}
				onChange={(e) => onChange(index, 'end', 'hour', e.target.value)}
			>
				{endOptions.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			<span>:</span>
			<select
				className={styles.timeSelect}
				value={slot.end.minute || '00'}
				onChange={(e) =>
					onChange(index, 'end', 'minute', e.target.value)
				}
			>
				{endMinutes.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	);
}

type HourOption = {
	label: string;
	value: string;
	minutes: { label: string; value: string }[];
};

function createHourOptions(
	precision: number,
	clockType: '12' | '24',
	minHour: string,
	includeEndOfDay: boolean
): HourOption[] {
	const options: HourOption[] = [];
	const minH = parseInt(minHour);

	for (let h = minH; h < 24; h++) {
		const hourStr = String(h).padStart(2, '0');
		let label: string;

		if (clockType === '12') {
			const suffix = h >= 12 ? 'pm' : 'am';
			const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
			label = `${display} ${suffix}`;
		} else {
			label = hourStr;
		}

		const minutes: { label: string; value: string }[] = [];
		for (let m = 0; m < 60; m += precision) {
			minutes.push({
				label: String(m).padStart(2, '0'),
				value: String(m).padStart(2, '0'),
			});
		}

		options.push({ label, value: hourStr, minutes });
	}

	if (includeEndOfDay) {
		options.push({
			label: clockType === '24' ? '24' : '12 am',
			value: '24',
			minutes: [{ label: '00', value: '00' }],
		});
	}

	return options;
}

// --- Main DateOverrides list ---

export default function DateOverrides({
	scheduleSlideoutId,
}: {
	scheduleSlideoutId: string;
}) {
	const { watch, getValues, setValue } = useFormContext();
	const { openSlideOut } = useSlideout();
	const clockType = useClockType();

	const overrides: OverrideGroup[] = watch('overrides') || [];

	const handleSaveGroup = (group: OverrideGroup) => {
		const current: OverrideGroup[] = getValues('overrides') || [];
		const index = current.findIndex((g) => g.id === group.id);

		if (index >= 0) {
			const updated = [...current];
			updated[index] = group;
			setValue('overrides', updated);
		} else {
			setValue('overrides', [...current, group]);
		}
	};

	const handleRemove = (groupId: string) => {
		const current: OverrideGroup[] = getValues('overrides') || [];
		setValue(
			'overrides',
			current.filter((g) => g.id !== groupId)
		);
	};

	const openEditor = (group?: OverrideGroup) => {
		const slideoutId = group ? `override-edit-${group.id}` : 'override-new';

		openSlideOut({
			id: slideoutId,
			parentId: scheduleSlideoutId,
			title: group
				? __('Edit date override', 'wpappointments')
				: __('Add date override', 'wpappointments'),
			content: (
				<OverrideEditor
					slideoutId={slideoutId}
					group={group}
					onSave={handleSaveGroup}
				/>
			),
		});
	};

	return (
		<div className={styles.dateOverrides}>
			<div className={styles.header}>
				<span className={styles.title}>
					{__('Date overrides', 'wpappointments')}
				</span>
				<Tooltip text={__('Add date override', 'wpappointments')}>
					<Button
						size="small"
						icon={plus}
						onClick={() => openEditor()}
						label={__('Add date override', 'wpappointments')}
					/>
				</Tooltip>
			</div>

			{overrides.length === 0 && (
				<p className={styles.emptyState}>
					{__('No date overrides yet.', 'wpappointments')}
				</p>
			)}

			{overrides.map((group) => {
				const isClosed = group.type === 'closed';

				return (
					<div
						key={group.id}
						className={styles.overrideRow}
						onClick={() => openEditor(group)}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								openEditor(group);
							}
						}}
					>
						<div className={styles.overrideInfo}>
							<span className={styles.overrideDate}>
								{formatDateList(group.dates)}
							</span>
							<span
								className={
									isClosed
										? styles.badgeClosed
										: styles.badgeCustom
								}
							>
								{isClosed
									? __('Unavailable', 'wpappointments')
									: group.slots
											.map((s) =>
												formatSlotSummary(s, clockType)
											)
											.join(', ')}
							</span>
						</div>
						<div
							className={styles.overrideActions}
							onClick={(e) => e.stopPropagation()}
						>
							<Tooltip
								text={__('Remove override', 'wpappointments')}
							>
								<Button
									size="small"
									icon={trash}
									isDestructive
									onClick={() => handleRemove(group.id)}
									label={__(
										'Remove override',
										'wpappointments'
									)}
								/>
							</Tooltip>
						</div>
					</div>
				);
			})}
		</div>
	);
}
