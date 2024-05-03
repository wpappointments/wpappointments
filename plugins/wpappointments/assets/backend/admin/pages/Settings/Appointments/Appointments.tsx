import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import Select from '~/backend/admin/components/FormField/Select/Select';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import globalStyles from 'global.module.css';

type Fields = {
	defaultLength: number;
	timePickerPrecision: number;
	serviceName: string;
	defaultStatus: 'confirmed' | 'pending';
};

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
			displayErrorToast('Error saving settings');
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
					<Text size="title">Appointments Settings</Text>
				</CardHeader>
				<CardBody>
					<FormFieldSet>
						<Input
							type="text"
							name="serviceName"
							label="Service Name"
							placeholder="Appointment"
							rules={{
								required: true,
							}}
						/>

						<Input
							type="number"
							name="defaultLength"
							label="Default appointment length (in minutes)"
							placeholder=""
							rules={{
								required: true,
							}}
						/>

						<Input
							type="number"
							name="timePickerPrecision"
							label="Time picker precision (in minutes)"
							placeholder=""
							rules={{
								required: true,
								min: 1,
								max: 60 * 24,
							}}
						/>
						<Select
							name="defaultStatus"
							defaultValue={settings.defaultStatus || 'confirmed'}
							options={[
								{ label: 'Confirmed', value: 'confirmed' },
								{ label: 'Pending', value: 'pending' },
							]}
							label={__(
								'Default appointment status',
								'wpappointments'
							)}
							rules={{
								required: true,
							}}
							help={__(
								'Default status for appointments created by your clients. You can change the status of each appointment individually.',
								'wpappointments'
							)}
						/>
					</FormFieldSet>
				</CardBody>
				<CardFooter>
					<Button type="submit" variant="primary">
						Save changes
					</Button>
				</CardFooter>
			</Card>
		</HtmlForm>
	);
});
