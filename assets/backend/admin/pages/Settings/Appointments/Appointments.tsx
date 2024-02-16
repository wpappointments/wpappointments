import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/backend/utils/experimental';
import apiFetch from '~/backend/utils/fetch';
import { store } from '~/backend/store/store';
import formStyles from '~/backend/admin/components/AppointmentForm/AppointmentForm.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import globalStyles from 'global.module.css';

type Fields = {
	defaultLength: number;
	timePickerPrecision: number;
};

export default withForm(function AppointmentsSettings() {
	const { setValue } = useFormContext();
	const dispatch = useDispatch(store);

	const { defaultLength, timePickerPrecision } = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	useEffect(() => {
		if (defaultLength !== undefined) {
			setValue('defaultLength', defaultLength);
		}
	}, [defaultLength]);

	useEffect(() => {
		if (timePickerPrecision !== undefined) {
			setValue('timePickerPrecision', timePickerPrecision);
		}
	}, [timePickerPrecision]);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/appointments',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ appointments: data });
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

						<div className={formStyles.formActions}>
							<Button type="submit" variant="primary">
								Save changes
							</Button>
						</div>
					</FormFieldSet>
				</CardBody>
			</Card>
		</HtmlForm>
	);
});
