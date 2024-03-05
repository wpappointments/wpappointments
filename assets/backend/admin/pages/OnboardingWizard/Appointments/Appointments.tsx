import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import Select from '~/backend/admin/components/FormField/Select/Select';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';

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

function AppointmentsSettings({ onSuccess }: { onSuccess: () => void }) {
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
			// displayErrorToast(error?.message);
			return;
		}

		if (response === null) {
			// displayErrorToast('Error saving settings');
			return;
		}

		if (response.data.message) {
			dispatch.setPluginSettings({ appointments: data });
			onSuccess();
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFields />
		</HtmlForm>
	);
}

function FormFields() {
	return (
		<div>
			<FormFieldSet style={{ marginBottom: 25 }}>
				<Input
					type="text"
					name="serviceName"
					label="Service Name"
					placeholder="Appointment"
					rules={{
						required: true,
					}}
					help={__(
						"Don't worry. You can always change it later.",
						'wpappointments'
					)}
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
					help={__(
						'People will be able to book appointments every n minutes. For example if set to 30 minutes people can book 8:00, 8:30, 9:00 etc.',
						'wpappointments'
					)}
				/>

				<Select
						name="defaultStatus"
						defaultValue="confirmed"
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

export default withForm(AppointmentsSettings);