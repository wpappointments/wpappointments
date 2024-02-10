import { useFormContext } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useSelect, select, useDispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import type { DayOpeningHours } from '~/store/settings/settings.types';
import { store } from '~/store/store';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import formStyles from '~/admin/components/AppointmentForm/AppointmentForm.module.css';
import { HtmlForm, withForm } from '~/admin/components/Form/Form';
import globalStyles from 'global.module.css';

type Fields = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

function ScheduleSettings() {
	const { setValue } = useFormContext();
	const dispatch = useDispatch(store);

	const schedule = useSelect(() => {
		return select(store).getScheduleSettings();
	}, []);

	useEffect(() => {
		const days = Object.keys(schedule) as Array<keyof typeof schedule>;

		for (const day of days) {
			setValue(day, schedule[day]);
		}
	}, [schedule]);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/schedule',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ schedule: data });
	};

	const fields = useMemo(() => {
		return Object.values(schedule).map((daySettings, index) => (
			<OpeningHoursDayOfWeek
				key={daySettings.day}
				showCopyToAllDays={index === 0}
				values={daySettings}
			/>
		));
	}, [schedule]);

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">Working hours</Text>
			</CardHeader>
			<CardBody>
				<HtmlForm onSubmit={onSubmit}>
					{fields}
					<div className={formStyles.formActions}>
						<Button type="submit" variant="primary">
							Save changes
						</Button>
					</div>
				</HtmlForm>
			</CardBody>
		</Card>
	);
}

export default withForm(ScheduleSettings);
