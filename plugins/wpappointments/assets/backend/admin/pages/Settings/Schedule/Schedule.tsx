import { useMemo, useState } from 'react';
import {
	Button,
	Card,
	CardFooter,
	CardHeader,
	CheckboxControl,
	ToggleControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { Button as WPButton, Tooltip } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import {
	CardBody,
	DataForm,
	DeleteModal,
	SelectInput,
	SlideoutHeaderActionsFill,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import type { Schedule } from '~/backend/store/schedules/schedules.types';
import type {
	Day,
	DayOpeningHours,
} from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import DateOverrides from './DateOverrides/DateOverrides';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import styles from './Schedule.module.css';
import {
	createSchedule,
	updateSchedule,
	deleteSchedule,
	setDefaultSchedule,
} from '~/backend/api/schedules';
import globalStyles from 'global.module.css';

// Sunday=0 to match JS/WP startOfWeek convention
const DAYS: Day[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
];

function getOrderedDays(startOfWeek: number = 1): Day[] {
	return [...DAYS.slice(startOfWeek), ...DAYS.slice(0, startOfWeek)];
}

function useOrderedDays(): Day[] {
	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const startOfWeek = generalSettings?.startOfWeek ?? 1;

	return getOrderedDays(startOfWeek);
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

function formatTimeSummary(schedule: Schedule): string {
	const enabledDays = DAYS.filter((day) => schedule.days[day]?.enabled);

	if (enabledDays.length === 0) {
		return __('No working days', 'wpappointments');
	}

	if (enabledDays.length === 7) {
		return __('Every day', 'wpappointments');
	}

	const dayLabels: Record<Day, string> = {
		monday: __('Mon', 'wpappointments'),
		tuesday: __('Tue', 'wpappointments'),
		wednesday: __('Wed', 'wpappointments'),
		thursday: __('Thu', 'wpappointments'),
		friday: __('Fri', 'wpappointments'),
		saturday: __('Sat', 'wpappointments'),
		sunday: __('Sun', 'wpappointments'),
	};

	return enabledDays.map((d) => dayLabels[d]).join(', ');
}

function useSiteTimezone(): string {
	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	return (
		generalSettings?.timezone ||
		Intl.DateTimeFormat().resolvedOptions().timeZone
	);
}

function useTimezoneOptions() {
	const timezones = Intl.supportedValuesOf('timeZone');

	return timezones.map((tz) => ({
		label: tz,
		value: tz,
	}));
}

function ScheduleRow({
	schedule,
	onClick,
	onToggle,
}: {
	schedule: Schedule;
	onClick: () => void;
	onToggle: (enabled: boolean) => void;
}) {
	return (
		<div
			className={styles.scheduleRow}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div className={styles.scheduleInfo}>
				<div className={styles.scheduleHeader}>
					<span className={styles.scheduleTitle}>
						{schedule.name}
					</span>
					{schedule.isDefault && (
						<span className={styles.badgeDefault}>
							{__('Default', 'wpappointments')}
						</span>
					)}
					<span
						className={
							schedule.active
								? styles.badgeActive
								: styles.badgeInactive
						}
					>
						{schedule.active
							? __('Active', 'wpappointments')
							: __('Inactive', 'wpappointments')}
					</span>
				</div>
				<span className={styles.scheduleDescription}>
					{formatTimeSummary(schedule)}
					{schedule.timezone ? ` · ${schedule.timezone}` : ''}
				</span>
			</div>
			{!schedule.isDefault && (
				<div
					className={styles.scheduleActions}
					onClick={(e) => e.stopPropagation()}
				>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={schedule.active}
						onChange={onToggle}
						label={schedule.name}
						className={styles.srOnlyLabel}
					/>
				</div>
			)}
		</div>
	);
}

type ScheduleFormData = {
	name: string;
	timezone: string;
};

function ScheduleEditor({
	schedule,
	isNew,
}: {
	schedule: Schedule;
	isNew?: boolean;
}) {
	const { openSlideOut, closeSlideOut, currentSlideout } = useSlideout();
	const [saving, setSaving] = useState(false);
	const siteTimezone = useSiteTimezone();
	const timezoneOptions = useTimezoneOptions();

	const orderedDays = useOrderedDays();
	const timePickerPrecision = useSelect(() => {
		return select(store).getAppointmentsSettings()?.timePickerPrecision;
	}, []);

	const [formData, setFormData] = useState<ScheduleFormData>(() => ({
		name: schedule.name,
		timezone: schedule.timezone || siteTimezone,
	}));

	const [overrides, setOverrides] = useState(schedule.overrides || []);

	const [daysData, setDaysData] = useState<Record<string, DayOpeningHours>>(
		() =>
			DAYS.reduce(
				(acc, day) => {
					acc[day] = schedule.days[day] || getDefaultDay(day);
					return acc;
				},
				{} as Record<string, DayOpeningHours>
			)
	);

	const fields: Field<ScheduleFormData>[] = useMemo(
		() => [
			{
				id: 'name',
				type: 'text' as const,
				label: __('Schedule name', 'wpappointments'),
				isValid: { required: true },
				Edit: TextInput,
			},
			{
				id: 'timezone',
				label: __('Timezone', 'wpappointments'),
				elements: timezoneOptions,
				Edit: SelectInput,
			},
		],
		[timezoneOptions]
	);

	const formConfig: Form = {
		layout: { type: 'regular' },
		fields: ['name', 'timezone'],
	};

	const { validity, isValid } = useFormValidity(formData, fields, formConfig);

	const handleDayChange = (day: string, value: DayOpeningHours) => {
		setDaysData((prev) => ({ ...prev, [day]: value }));
	};

	const slideoutId = isNew ? 'schedule-new' : `schedule-${schedule.id}`;

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		setSaving(true);

		const { name, timezone } = formData;

		if (isNew) {
			const result = await createSchedule({
				name,
				timezone,
				days: daysData,
				overrides,
			});
			setSaving(false);

			if (result) {
				closeSlideOut(slideoutId);
			}
		} else {
			const result = await updateSchedule(schedule.id, {
				name,
				timezone,
				days: daysData,
				overrides,
			});
			setSaving(false);

			if (result) {
				closeSlideOut(slideoutId);
			}
		}
	};

	const canDelete = !isNew && !schedule.isDefault;
	const dangerSlideoutId = `schedule-${schedule.id}-danger`;
	const isTopSlideout = currentSlideout?.id === slideoutId;

	const openDangerZone = () => {
		openSlideOut({
			id: dangerSlideoutId,
			parentId: slideoutId,
			title: __('Danger zone', 'wpappointments'),
			content: (
				<DangerZoneContent
					scheduleId={schedule.id}
					slideoutId={slideoutId}
					dangerSlideoutId={dangerSlideoutId}
				/>
			),
		});
	};

	return (
		<>
			{canDelete && isTopSlideout && (
				<SlideoutHeaderActionsFill>
					<Tooltip text={__('Delete schedule', 'wpappointments')}>
						<WPButton
							icon={trash}
							isDestructive
							onClick={openDangerZone}
							label={__('Delete schedule', 'wpappointments')}
						/>
					</Tooltip>
				</SlideoutHeaderActionsFill>
			)}
			<div className={styles.editorContent}>
				<DataForm
					data={formData}
					fields={fields}
					form={formConfig}
					onChange={(edits) =>
						setFormData((prev) => ({ ...prev, ...edits }))
					}
					validity={validity}
				/>
				<div>
					<Text
						size=""
						style={{
							marginBottom: '12px',
							display: 'block',
							fontWeight: 500,
						}}
					>
						{__('Working hours', 'wpappointments')}
					</Text>
					{orderedDays.map((day) => (
						<OpeningHoursDayOfWeek
							key={day}
							day={day}
							allDays={orderedDays}
							timePickerPrecision={timePickerPrecision}
							dayData={daysData[day] || getDefaultDay(day)}
							onChange={handleDayChange}
						/>
					))}
				</div>
				<DateOverrides
					scheduleSlideoutId={slideoutId}
					overrides={overrides}
					onOverridesChange={setOverrides}
				/>
				{!isNew && (
					<ToggleControl
						__nextHasNoMarginBottom
						label={__('Default schedule', 'wpappointments')}
						checked={schedule.isDefault}
						disabled={schedule.isDefault || !schedule.active}
						help={
							schedule.isDefault
								? undefined
								: !schedule.active
									? __(
											'Activate this schedule first to set it as default.',
											'wpappointments'
										)
									: undefined
						}
						onChange={async (checked) => {
							if (checked) {
								const result = await setDefaultSchedule(
									schedule.id
								);
								if (result) {
									closeSlideOut(slideoutId);
								}
							}
						}}
					/>
				)}
				<Button
					variant="primary"
					onClick={onSubmit}
					isBusy={saving}
					disabled={!isValid}
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: '22px 0px',
						marginTop: '16px',
					}}
				>
					{isNew
						? __('Create schedule', 'wpappointments')
						: __('Save changes', 'wpappointments')}
				</Button>
			</div>
		</>
	);
}

function DangerZoneContent({
	scheduleId,
	slideoutId,
	dangerSlideoutId,
}: {
	scheduleId: number;
	slideoutId: string;
	dangerSlideoutId: string;
}) {
	const { closeSlideOut } = useSlideout();
	const [reassign, setReassign] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const handleDelete = async () => {
		const result = await deleteSchedule(scheduleId, reassign);
		setShowConfirm(false);
		if (result) {
			closeSlideOut(dangerSlideoutId);
			closeSlideOut(slideoutId);
		}
	};

	return (
		<div className={styles.dangerZoneContent}>
			<div>
				<p className={styles.dangerZoneDescription}>
					{__(
						'Deleting this schedule is permanent and cannot be undone. Any bookings currently using this schedule will lose their schedule assignment and become unavailable for booking.',
						'wpappointments'
					)}
				</p>
				<p className={styles.dangerZoneDescription}>
					{__(
						'If you wish to keep the bookings available, you can choose to reassign them to the default schedule.',
						'wpappointments'
					)}
				</p>
				<CheckboxControl
					label={__(
						'Reassign all bookings using this schedule to the default schedule',
						'wpappointments'
					)}
					checked={reassign}
					onChange={setReassign}
				/>
				<p className={styles.dangerZoneHelp}>
					{reassign
						? __(
								'All bookings using this schedule will be moved to the default schedule and will remain available for booking.',
								'wpappointments'
							)
						: __(
								'Bookings using this schedule will have no schedule assigned and will become unavailable for booking until a new schedule is assigned.',
								'wpappointments'
							)}
				</p>
			</div>
			<Button
				variant="primary"
				isDestructive
				onClick={() => setShowConfirm(true)}
				style={{
					width: '100%',
					justifyContent: 'center',
					padding: '22px 0px',
					marginTop: '24px',
				}}
			>
				{__('Delete schedule', 'wpappointments')}
			</Button>

			{showConfirm && (
				<DeleteModal
					title={__('Delete Schedule', 'wpappointments')}
					message={
						reassign
							? __(
									'Are you sure? All bookings using this schedule will be reassigned to the default schedule.',
									'wpappointments'
								)
							: __(
									'Are you sure? Bookings using this schedule will become unavailable for booking.',
									'wpappointments'
								)
					}
					onConfirmClick={handleDelete}
					closeModal={() => setShowConfirm(false)}
				/>
			)}
		</div>
	);
}

export default function ScheduleSettings() {
	const { openSlideOut } = useSlideout();

	const schedules = useSelect(() => {
		return select(store).getSchedules();
	}, []);

	const siteTimezone = useSiteTimezone();

	const handleOpen = (schedule: Schedule) => () => {
		openSlideOut({
			id: `schedule-${schedule.id}`,
			title: (
				<span className={styles.slideoutTitle}>
					{schedule.name}
					{!schedule.active && (
						<span className={styles.badgeInactiveHeader}>
							{__('Inactive', 'wpappointments')}
						</span>
					)}
				</span>
			),
			content: <ScheduleEditor schedule={schedule} />,
		});
	};

	const handleToggle = (schedule: Schedule) => async (active: boolean) => {
		await updateSchedule(schedule.id, { active });
	};

	const handleCreate = () => {
		const emptySchedule: Schedule = {
			id: 0,
			name: '',
			timezone: siteTimezone,
			active: true,
			isDefault: false,
			days: DAYS.reduce(
				(acc, day) => {
					acc[day] = getDefaultDay(day);
					return acc;
				},
				{} as Record<string, DayOpeningHours>
			),
			overrides: [],
		};

		openSlideOut({
			id: 'schedule-new',
			title: __('New schedule', 'wpappointments'),
			content: <ScheduleEditor schedule={emptySchedule} isNew />,
		});
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">{__('Schedules', 'wpappointments')}</Text>
			</CardHeader>
			<CardBody style={{ padding: 0 }}>
				<div className={styles.scheduleList}>
					{schedules.map((schedule) => (
						<ScheduleRow
							key={schedule.id}
							schedule={schedule}
							onToggle={handleToggle(schedule)}
							onClick={handleOpen(schedule)}
						/>
					))}
					{schedules.length === 0 && (
						<div className={styles.emptyState}>
							{__(
								'No schedules yet. Create one to get started.',
								'wpappointments'
							)}
						</div>
					)}
				</div>
			</CardBody>
			<CardFooter>
				<Button variant="secondary" onClick={handleCreate}>
					{__('Add schedule', 'wpappointments')}
				</Button>
			</CardFooter>
		</Card>
	);
}
