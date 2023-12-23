import { useForm } from 'react-hook-form';
import { useMemo } from '@wordpress/element';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import { store } from '~/store/store';
import type { DayOpeningHours } from '~/store/settings/settings.types';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import { DEFAULT_SETTINGS_STATE } from '~/store/settings/settings';
import { card } from 'global.module.css';
import { formActions } from '../Settings.module.css';

type Fields = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

export default function ScheduleSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Fields>({
		defaultValues: DEFAULT_SETTINGS_STATE.schedule,
	});

	const settings = useSelect(() => {
		const appStore = select(store);
		const settings = appStore.getScheduleSettings();

		if ('monday' in settings) {
			const days = Object.keys(settings) as Array<keyof typeof settings>;

			for (const day of days) {
				setValue(day, settings[day]);
			}

			return settings;
		}

		return settings;
	}, []);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/schedule',
			method: 'PATCH',
			data,
		});

		// dispatch.setPluginSettings( { schedule: data } );
	};

	const enableCheckboxes = Object.keys(settings).map((day: keyof Fields) => {
		if ('monday' in settings) {
			return settings[day];
		}

		return false;
	});

	const fields = useMemo(() => {
		return Object.values(settings).map((daySettings, index) => (
			<OpeningHoursDayOfWeek
				key={daySettings.day}
				showCopyToAllDays={index === 0}
				values={daySettings}
				control={control}
				errors={errors}
			/>
		));
	}, enableCheckboxes);

	return (
		<Card className={card}>
			<CardHeader>
				<Text size="title">Working hours</Text>
			</CardHeader>
			<CardBody>
				<form onSubmit={handleSubmit(onSubmit)}>
					{fields}
					<div className={formActions}>
						<Button type="submit" variant="primary">
							Save changes
						</Button>
					</div>
				</form>
			</CardBody>
		</Card>
	);
}
