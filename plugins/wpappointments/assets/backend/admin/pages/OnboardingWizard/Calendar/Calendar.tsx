import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import {
	DataForm,
	FormFieldSet,
	SelectInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';

type Fields = {
	clockType: '12' | '24';
	startOfWeek: string;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

const fields: Field<Fields>[] = [
	{
		id: 'startOfWeek',
		label: __('Week starts on', 'wpappointments'),
		isValid: { required: true },
		elements: [
			{ label: __('Sunday', 'wpappointments'), value: '0' },
			{ label: __('Monday', 'wpappointments'), value: '1' },
			{ label: __('Tuesday', 'wpappointments'), value: '2' },
			{ label: __('Wednesday', 'wpappointments'), value: '3' },
			{ label: __('Thursday', 'wpappointments'), value: '4' },
			{ label: __('Friday', 'wpappointments'), value: '5' },
			{ label: __('Saturday', 'wpappointments'), value: '6' },
		],
		Edit: SelectInput,
	},
	{
		id: 'clockType',
		label: __('Clock type', 'wpappointments'),
		isValid: { required: true },
		elements: [
			{ label: __('12 hours', 'wpappointments'), value: '12' },
			{ label: __('24 hours', 'wpappointments'), value: '24' },
		],
		Edit: SelectInput,
	},
];

const formConfig: Form = {
	layout: { type: 'regular' },
	fields: ['startOfWeek', 'clockType'],
};

export default function CalendarSettings({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const dispatch = useDispatch(store);
	const [error, setError] = useState<string | null>(null);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const [formData, setFormData] = useState<Fields>(() => ({
		startOfWeek:
			settings?.startOfWeek?.toString() ??
			getSettings().l10n.startOfWeek.toString(),
		clockType: settings?.clockType ?? '24',
	}));

	useEffect(() => {
		if (!settings) return;
		setFormData({
			startOfWeek:
				settings.startOfWeek?.toString() ??
				getSettings().l10n.startOfWeek.toString(),
			clockType: settings.clockType ?? '24',
		});
	}, [settings]);

	const { validity, isValid } = useFormValidity(formData, fields, formConfig);

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		const payload = {
			...formData,
			startOfWeek: Number(formData.startOfWeek),
		};

		const [err, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/general',
				method: 'PATCH',
				data: payload,
			});
		});

		if (err) {
			setError(err?.message);
			return;
		}

		if (response === null) {
			setError(__('Error saving settings', 'wpappointments'));
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ general: payload });
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
				{__('Continue', 'wpappointments')}
			</Button>
		</div>
	);
}
