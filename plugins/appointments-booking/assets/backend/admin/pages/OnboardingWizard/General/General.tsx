import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	DataForm,
	FormFieldSet,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

const fields: Field<Fields>[] = [
	{
		id: 'firstName',
		type: 'text',
		label: __('First name', 'appointments-booking'),
		placeholder: __('Eg. John', 'appointments-booking'),
		isValid: { required: true },
		Edit: TextInput,
	},
	{
		id: 'lastName',
		type: 'text',
		label: __('Last name', 'appointments-booking'),
		placeholder: __('Eg. Doe', 'appointments-booking'),
		isValid: { required: true },
		Edit: TextInput,
	},
	{
		id: 'email',
		type: 'email',
		label: __('Email', 'appointments-booking'),
		placeholder: 'example@example.com',
		isValid: { required: true },
		Edit: TextInput,
	},
	{
		id: 'phoneNumber',
		type: 'telephone',
		label: __('Phone number', 'appointments-booking'),
		placeholder: __('Eg. +1992334211', 'appointments-booking'),
		Edit: TextInput,
	},
];

const form: Form = {
	layout: { type: 'regular' },
	fields: ['firstName', 'lastName', 'email', 'phoneNumber'],
};

export default function GeneralSettings({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const dispatch = useDispatch(store);
	const [error, setError] = useState<string | null>(null);

	const settings = useSelect((select) => {
		return select(store).getGeneralSettings();
	}, []);

	const [formData, setFormData] = useState<Fields>(() => ({
		firstName: settings?.firstName ?? '',
		lastName: settings?.lastName ?? '',
		email: settings?.email ?? '',
		phoneNumber: settings?.phoneNumber ?? '',
	}));

	useEffect(() => {
		if (!settings) return;
		setFormData({
			firstName: settings.firstName ?? '',
			lastName: settings.lastName ?? '',
			email: settings.email ?? '',
			phoneNumber: settings.phoneNumber ?? '',
		});
	}, [settings]);

	const { validity, isValid } = useFormValidity(formData, fields, form);

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		const [err, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/general',
				method: 'PATCH',
				data: formData,
			});
		});

		if (err) {
			setError(err?.message);
			return;
		}

		if (response === null) {
			setError(__('Error saving settings', 'appointments-booking'));
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ general: formData });
			onSuccess();
		}
	};

	return (
		<div>
			{error && <div className={styles.error}>{error}</div>}
			<FormFieldSet style={{ marginBottom: 25 }}>
				<DataForm
					data={formData}
					fields={fields}
					form={form}
					onChange={(edits) =>
						setFormData((prev) => ({ ...prev, ...edits }))
					}
					validity={validity}
				/>
			</FormFieldSet>
			<Button
				className={styles.stepButton}
				onClick={onSubmit}
				disabled={!isValid}
				variant="primary"
			>
				{__('Continue', 'appointments-booking')}
			</Button>
		</div>
	);
}
