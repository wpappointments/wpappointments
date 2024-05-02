import { useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { useSchedule } from '~/backend/hooks/useSchedule';
import { DayOpeningHours } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import OpeningHoursDayOfWeek from '../../Settings/Schedule/OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import styles from '../OnboardingWizard.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';

type Fields = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

function normalizeSchedule(schedule: Fields) {
	const normalizedSchedule: Fields = {} as Fields;

	for (const [day, data] of Object.entries(schedule)) {
		const normalized = { ...data } as DayOpeningHours;

		if (!normalized?.allDay) {
			normalized.allDay = false;
		}

		normalizedSchedule[day as keyof Fields] = normalized;
	}

	return normalizedSchedule;
}

function ScheduleSettings({ onSuccess }: { onSuccess: () => void }) {
	const dispatch = useDispatch(store);
	const [error, setError] = useState<string | null>(null);

	const settings = useSelect(() => {
		return select(store).getScheduleSettings();
	}, []);

	useFillFormValues(settings);

	const onSubmit = async (rawData: Fields) => {
		const data = normalizeSchedule(rawData);

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/schedule',
				method: 'PATCH',
				data,
			});

			return response;
		});

		if (error) {
			setError(error?.message);
			return;
		}

		if (response === null) {
			setError('Error saving settings');
			return;
		}

		if (response.data.message) {
			dispatch.setPluginSettings({ schedule: data });
			onSuccess();
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			{error && <div className={styles.error}>{error}</div>}
			<FormFields />
		</HtmlForm>
	);
}

function FormFields() {
	const { schedule, timePickerPrecision } = useSchedule();

	return (
		<div>
			<div style={{ marginBottom: 25 }}>
				{Object.values(schedule).map((daySettings, index) => (
					<OpeningHoursDayOfWeek
						key={daySettings.day}
						showCopyToAllDays={index === 0}
						values={daySettings}
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
		</div>
	);
}

export default withForm(ScheduleSettings);
