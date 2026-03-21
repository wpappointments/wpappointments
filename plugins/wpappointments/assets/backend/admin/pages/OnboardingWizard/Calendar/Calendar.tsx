import { useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import {
	FormFieldSet,
	HtmlForm,
	Select,
	withForm,
} from '@wpappointments/components';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import styles from '../OnboardingWizard.module.css';

type Fields = {
	clockType: '12' | '24';
	startOfWeek: number;
};

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

function CalendarSettings({ onSuccess }: { onSuccess: () => void }) {
	const dispatch = useDispatch(store);
	const [error, setError] = useState<string | null>(null);

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
			setError(error?.message);
			return;
		}

		if (response === null) {
			setError(__('Error saving settings', 'wpappointments'));
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ general: data });
			onSuccess();
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			{error && <div className={styles.error}>{error}</div>}
			<FormFields />
		</HtmlForm>
	);
}

function FormFields() {
	return (
		<div>
			<FormFieldSet style={{ marginBottom: 25 }}>
				<Select
					name="startOfWeek"
					label={__('Week starts on', 'wpappointments')}
					rules={{
						required: true,
					}}
					options={[
						{
							label: __('Sunday', 'wpappointments'),
							value: '0',
						},
						{
							label: __('Monday', 'wpappointments'),
							value: '1',
						},
						{
							label: __('Tuesday', 'wpappointments'),
							value: '2',
						},
						{
							label: __('Wednesday', 'wpappointments'),
							value: '3',
						},
						{
							label: __('Thursday', 'wpappointments'),
							value: '4',
						},
						{
							label: __('Friday', 'wpappointments'),
							value: '5',
						},
						{
							label: __('Saturday', 'wpappointments'),
							value: '6',
						},
					]}
					defaultValue={getSettings().l10n.startOfWeek.toString()}
				/>
				<Select
					name="clockType"
					label={__('Clock type', 'wpappointments')}
					rules={{
						required: true,
					}}
					options={[
						{
							label: __('12 hours', 'wpappointments'),
							value: '12',
						},
						{
							label: __('24 hours', 'wpappointments'),
							value: '24',
						},
					]}
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

export default withForm(CalendarSettings);
