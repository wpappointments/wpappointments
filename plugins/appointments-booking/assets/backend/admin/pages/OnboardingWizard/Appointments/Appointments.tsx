import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	DataForm,
	FormFieldSet,
	NumberInput,
	SelectInput,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';

type Fields = {
	coreEntityName: string;
	defaultLength: number;
	timePickerPrecision: number;
	defaultStatus: 'confirmed' | 'pending';
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

const fields: Field<Fields>[] = [
	{
		id: 'coreEntityName',
		type: 'text',
		label: __('Service Name', 'appointments-booking'),
		placeholder: __('Appointment', 'appointments-booking'),
		description: __(
			"Don't worry. You can always change it later.",
			'appointments-booking'
		),
		isValid: { required: true },
		Edit: TextInput,
	},
	{
		id: 'defaultLength',
		type: 'integer',
		label: __(
			'Default appointment length (in minutes)',
			'appointments-booking'
		),
		isValid: { required: true, min: 1 },
		Edit: NumberInput,
	},
	{
		id: 'timePickerPrecision',
		type: 'integer',
		label: __('Time picker precision (in minutes)', 'appointments-booking'),
		description: __(
			'People will be able to book appointments every n minutes. For example if set to 30 minutes people can book 8:00, 8:30, 9:00 etc.',
			'appointments-booking'
		),
		isValid: { required: true, min: 1, max: 60 * 24 },
		Edit: NumberInput,
	},
	{
		id: 'defaultStatus',
		label: __('Default appointment status', 'appointments-booking'),
		description: __(
			'Default status for appointments created by your clients. You can change the status of each appointment individually. If Pending selected, you will have to confirm each appointment manually.',
			'appointments-booking'
		),
		isValid: { required: true },
		elements: [
			{
				label: __('Confirmed', 'appointments-booking'),
				value: 'confirmed',
			},
			{ label: __('Pending', 'appointments-booking'), value: 'pending' },
		],
		Edit: SelectInput,
	},
];

const formConfig: Form = {
	layout: { type: 'regular' },
	fields: [
		'coreEntityName',
		'defaultLength',
		'timePickerPrecision',
		'defaultStatus',
	],
};

export default function AppointmentsSettings({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const dispatch = useDispatch(store);
	const [error, setError] = useState<string | null>(null);

	const settings = useSelect((select) => {
		return select(store).getAppointmentsSettings();
	}, []);

	const [formData, setFormData] = useState<Fields>(() => ({
		coreEntityName: settings?.coreEntityName ?? '',
		defaultLength: settings?.defaultLength ?? 30,
		timePickerPrecision: settings?.timePickerPrecision ?? 15,
		defaultStatus: settings?.defaultStatus ?? 'confirmed',
	}));

	useEffect(() => {
		if (!settings) return;
		setFormData({
			coreEntityName: settings.coreEntityName ?? '',
			defaultLength: settings.defaultLength ?? 30,
			timePickerPrecision: settings.timePickerPrecision ?? 15,
			defaultStatus: settings.defaultStatus ?? 'confirmed',
		});
	}, [settings]);

	const { validity, isValid } = useFormValidity(formData, fields, formConfig);

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		const [err, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/appointments',
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
			dispatch.setPluginSettings({ appointments: formData });
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
					form={formConfig}
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
