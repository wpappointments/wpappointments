import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import styles from '../OnboardingWizard.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

function GeneralSettings({ onSuccess }: { onSuccess: () => void }) {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	useFillFormValues(settings);

	const onSubmit = async (data: Fields) => {
		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/general',
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
			dispatch.setPluginSettings({ general: data });
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
					name="firstName"
					label={__('First name', 'wpappointments')}
					placeholder="Eg. John"
					rules={{
						required: true,
					}}
				/>

				<Input
					name="lastName"
					label={__('Last name', 'wpappointments')}
					placeholder="Eg. Doe"
					rules={{
						required: true,
					}}
				/>

				<Input
					name="email"
					label={__('Email', 'wpappointments')}
					placeholder="example@example.com"
					rules={{
						required: true,
					}}
				/>

				<Input
					name="phoneNumber"
					label={__('Phone number', 'wpappointments')}
					placeholder="Eg. +1992334211"
				/>
			</FormFieldSet>
			<Button className={styles.stepButton} type="submit" variant="primary">
				{__('Continue', 'wpappointments')}
			</Button>
		</div>
	);
}

export default withForm(GeneralSettings);
