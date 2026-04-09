import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import type {
	Day,
	DayOpeningHours,
} from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';
import OpeningHoursDayOfWeek from '~/backend/admin/pages/Settings/Schedule/OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import { createSchedule, updateSchedule } from '~/backend/api/schedules';

const DAYS_FROM_SUNDAY: Day[] = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
];

function useOrderedDays(): Day[] {
	const generalSettings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const startOfWeek = generalSettings?.startOfWeek ?? 1;

	return [
		...DAYS_FROM_SUNDAY.slice(startOfWeek),
		...DAYS_FROM_SUNDAY.slice(0, startOfWeek),
	];
}

type ScheduleData = Record<string, DayOpeningHours>;

export default function ScheduleSettings({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const orderedDays = useOrderedDays();
	const [formData, setFormData] = useState<ScheduleData>({});

	const existingSchedules = useSelect(() => {
		return select(store).getSchedules();
	}, []);

	useEffect(() => {
		const defaultSchedule = existingSchedules.find((s) => s.isDefault);
		if (defaultSchedule?.days) {
			setFormData((prev) => ({ ...defaultSchedule.days, ...prev }));
		}
	}, [existingSchedules]);

	const timePickerPrecision = useSelect(() => {
		return select(store).getAppointmentsSettings()?.timePickerPrecision;
	}, []);

	const handleDayChange = (day: string, value: DayOpeningHours) => {
		setFormData((prev) => ({ ...prev, [day]: value }));
	};

	const getDayData = (day: Day): DayOpeningHours => {
		return (
			formData[day] || {
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
			}
		);
	};

	const onSubmit = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		setError(null);

		try {
			// Build complete days map including untouched days with defaults.
			const allDays: ScheduleData = {};
			for (const day of orderedDays) {
				allDays[day] = getDayData(day);
			}

			let result;

			try {
				if (existingSchedules.length > 0) {
					const defaultSchedule = existingSchedules.find(
						(s) => s.isDefault
					);
					if (defaultSchedule) {
						result = await updateSchedule(defaultSchedule.id, {
							days: allDays,
						});
					} else {
						result = await createSchedule({
							name: __('Default', 'wpappointments'),
							days: allDays,
						});
					}
				} else {
					result = await createSchedule({
						name: __('Default', 'wpappointments'),
						days: allDays,
					});
				}
			} catch (err) {
				const message =
					err instanceof Error && err.message
						? err.message
						: __('Error saving schedule', 'wpappointments');
				setError(message);
				return;
			}

			if (!result) {
				setError(__('Error saving schedule', 'wpappointments'));
				return;
			}

			onSuccess();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			{error && <div className={styles.error}>{error}</div>}
			<div style={{ marginBottom: 25 }}>
				{orderedDays.map((day) => (
					<OpeningHoursDayOfWeek
						key={day}
						day={day}
						allDays={orderedDays}
						timePickerPrecision={timePickerPrecision}
						dayData={getDayData(day)}
						onChange={handleDayChange}
					/>
				))}
			</div>
			<Button
				className={styles.stepButton}
				onClick={onSubmit}
				variant="primary"
				isBusy={isSubmitting}
				disabled={isSubmitting}
			>
				{__('Continue', 'wpappointments')}
			</Button>
		</div>
	);
}
