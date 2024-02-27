import { useFormContext } from 'react-hook-form';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { useSelect, select, useDispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { Text } from '~/backend/utils/experimental';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import type { DayOpeningHours } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
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

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

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
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/schedule',
				method: 'PATCH',
				data,
			});

			return response;
		});

		if (error) {
			displayErrorToast(error?.message);
			return;
		}

		if (response === null) {
			displayErrorToast('Error saving settings');
			return;
		}

		if (response.data.message) {
			dispatch.setPluginSettings({ schedule: data });
			displaySuccessToast(response.data.message);
		}
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
		<HtmlForm onSubmit={onSubmit}>
			<Card className={globalStyles.card}>
				<CardHeader>
					<Text size="title">Working hours</Text>
				</CardHeader>
				<CardBody>
					{fields}
				</CardBody>
				<CardFooter>
					<Button type="submit" variant="primary">
						Save changes
					</Button>
				</CardFooter>
			</Card>
		</HtmlForm>
	);
}

export default withForm(ScheduleSettings);