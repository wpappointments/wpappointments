import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { HtmlForm, withForm } from '@wpappointments/components';
import type {
	Day,
	DayOpeningHours,
} from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import OpeningHoursDayOfWeek from '../../Settings/Schedule/OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import styles from '../OnboardingWizard.module.css';
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

type ScheduleFormFields = Record<string, DayOpeningHours>;

function ScheduleSettings({ onSuccess }: { onSuccess: () => void }) {
	const [error, setError] = useState<string | null>(null);
	const orderedDays = useOrderedDays();

	const existingSchedules = useSelect(() => {
		return select(store).getSchedules();
	}, []);

	const timePickerPrecision = useSelect(() => {
		return select(store).getAppointmentsSettings()?.timePickerPrecision;
	}, []);

	const onSubmit: SubmitHandler<ScheduleFormFields> = async (data) => {
		setError(null);

		let result;

		if (existingSchedules.length > 0) {
			const defaultSchedule = existingSchedules.find((s) => s.isDefault);
			if (defaultSchedule) {
				result = await updateSchedule(defaultSchedule.id, {
					days: data,
				});
			}
		} else {
			result = await createSchedule({
				name: __('Default', 'wpappointments'),
				days: data,
			});
		}

		if (!result) {
			setError(__('Error saving schedule', 'wpappointments'));
			return;
		}

		onSuccess();
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			{error && <div className={styles.error}>{error}</div>}
			<div style={{ marginBottom: 25 }}>
				{orderedDays.map((day) => (
					<OpeningHoursDayOfWeek
						key={day}
						day={day}
						allDays={orderedDays}
						timePickerPrecision={timePickerPrecision}
					/>
				))}
			</div>
			<Button
				className={styles.stepButton}
				type="submit"
				variant="primary"
			>
				{__('Continue', 'wpappointments')}
			</Button>
		</HtmlForm>
	);
}

export default withForm(ScheduleSettings);
