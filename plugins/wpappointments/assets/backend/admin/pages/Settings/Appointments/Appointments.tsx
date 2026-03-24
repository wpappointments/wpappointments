import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	FormFieldSet,
	HtmlForm,
	Input,
	Select,
	withForm,
} from '@wpappointments/components';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import type { LeadTimeUnit } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import globalStyles from 'global.module.css';

type Fields = {
	defaultLength: number;
	timePickerPrecision: number;
	serviceName: string;
	defaultStatus: 'confirmed' | 'pending';
	minLeadTimeValue: number;
	minLeadTimeUnit: LeadTimeUnit;
	maxLeadTimeValue: number;
	maxLeadTimeUnit: LeadTimeUnit;
};

const LEAD_TIME_UNIT_OPTIONS = [
	{ label: __('Minutes', 'wpappointments'), value: 'minute' },
	{ label: __('Hours', 'wpappointments'), value: 'hour' },
	{ label: __('Days', 'wpappointments'), value: 'day' },
	{ label: __('Weeks', 'wpappointments'), value: 'week' },
	{ label: __('Months', 'wpappointments'), value: 'month' },
];

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

export default withForm(function AppointmentsSettings() {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	useFillFormValues(settings);

	const onSubmit = async (data: Fields) => {
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/appointments',
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
			dispatch.setPluginSettings({ appointments: data });
			displaySuccessToast(response.message);
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<Card className={globalStyles.card}>
				<CardHeader>
					<Text size="title">
						{__('Appointments Settings', 'wpappointments')}
					</Text>
				</CardHeader>
				<CardBody>
					<FormFieldSet>
						<Input
							type="text"
							name="serviceName"
							label={__('Service Name', 'wpappointments')}
							placeholder={__('Appointment', 'wpappointments')}
						/>

						<Input
							type="number"
							name="defaultLength"
							label={__(
								'Default appointment length (in minutes)',
								'wpappointments'
							)}
							placeholder=""
						/>

						<Input
							type="number"
							name="timePickerPrecision"
							label={__(
								'Time picker precision (in minutes)',
								'wpappointments'
							)}
							placeholder=""
							rules={{
								min: 1,
								max: 60 * 24,
							}}
						/>
						<FormFieldSet horizontal>
							<Input
								type="number"
								name="minLeadTimeValue"
								label={__(
									'Minimum lead time',
									'wpappointments'
								)}
								placeholder="0"
								rules={{ min: 0 }}
							/>
							<Select
								name="minLeadTimeUnit"
								label={__(
									'Minimum lead time unit',
									'wpappointments'
								)}
								labelInvisible
								defaultValue={
									settings.minLeadTimeUnit || 'minute'
								}
								options={LEAD_TIME_UNIT_OPTIONS}
							/>
						</FormFieldSet>

						<FormFieldSet horizontal>
							<Input
								type="number"
								name="maxLeadTimeValue"
								label={__(
									'Maximum lead time',
									'wpappointments'
								)}
								placeholder="0"
								rules={{ min: 0 }}
								help={__(
									'Leave at 0 for no limit.',
									'wpappointments'
								)}
							/>
							<Select
								name="maxLeadTimeUnit"
								label={__(
									'Maximum lead time unit',
									'wpappointments'
								)}
								labelInvisible
								defaultValue={settings.maxLeadTimeUnit || 'day'}
								options={LEAD_TIME_UNIT_OPTIONS}
							/>
						</FormFieldSet>

						<Select
							name="defaultStatus"
							defaultValue={settings.defaultStatus || 'confirmed'}
							options={[
								{
									label: __('Confirmed', 'wpappointments'),
									value: 'confirmed',
								},
								{
									label: __('Pending', 'wpappointments'),
									value: 'pending',
								},
							]}
							label={__(
								'Default appointment status',
								'wpappointments'
							)}
							help={__(
								'Default status for appointments created by your clients. You can change the status of each appointment individually.',
								'wpappointments'
							)}
						/>
					</FormFieldSet>
				</CardBody>
				<CardFooter>
					<Button type="submit" variant="primary">
						{__('Save changes', 'wpappointments')}
					</Button>
				</CardFooter>
			</Card>
		</HtmlForm>
	);
});
