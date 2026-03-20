import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { HtmlForm, withForm } from '@wpappointments/components';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { useSchedule } from '~/backend/hooks/useSchedule';
import type { DayOpeningHours } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import OpeningHoursDayOfWeek from './OpeningHoursDayOfWeek/OpeningHoursDayOfWeek';
import globalStyles from 'global.module.css';

export type ScheduleFormFields = {
	monday: DayOpeningHours;
	tuesday: DayOpeningHours;
	wednesday: DayOpeningHours;
	thursday: DayOpeningHours;
	friday: DayOpeningHours;
	saturday: DayOpeningHours;
	sunday: DayOpeningHours;
};

type Response = APIResponse<{
	data: ScheduleFormFields;
	message: string;
}>;

function ScheduleSettings() {
	const { schedule, timePickerPrecision } = useSchedule();
	const dispatch = useDispatch(store);

	const onSubmit = async (data: ScheduleFormFields) => {
		const days = Object.keys(data) as Array<keyof typeof data>;

		for (const day of days) {
			const dayData = data[day];
			if (!('slots' in dayData)) {
				(dayData as DayOpeningHours).slots = {
					list: [
						{
							start: {
								hour: null,
								minute: null,
							},
							end: {
								hour: null,
								minute: null,
							},
						},
					],
				};
			}
		}

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
			displayErrorToast(__('Error saving settings', 'wpappointments'));
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ schedule: data });
			displaySuccessToast(response.message);
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<Card className={globalStyles.card}>
				<CardHeader>
					<Text size="title">
						{__('Working hours', 'wpappointments')}
					</Text>
				</CardHeader>
				<CardBody>
					{Object.values(schedule).map((daySettings, index) => (
						<OpeningHoursDayOfWeek
							key={daySettings.day}
							showCopyToAllDays={index === 0}
							values={daySettings}
							timePickerPrecision={timePickerPrecision}
						/>
					))}
				</CardBody>
				<CardFooter>
					<Button type="submit" variant="primary">
						{__('Save changes', 'wpappointments')}
					</Button>
				</CardFooter>
			</Card>
		</HtmlForm>
	);
}

export default withForm(ScheduleSettings);
