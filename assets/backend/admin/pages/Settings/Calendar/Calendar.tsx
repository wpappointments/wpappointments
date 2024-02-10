import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import { store } from '~/store/store';
import formStyles from '~/admin/components/AppointmentForm/AppointmentForm.module.css';
import { HtmlForm, withForm } from '~/admin/components/Form/Form';
import FormFieldSet from '~/admin/components/FormFieldSet/FormFieldSet';
import globalStyles from 'global.module.css';

type Fields = {};

export default withForm(function CalendarSettings() {
	// use below to set values
	// const { setValue } = useFormContext();
	const dispatch = useDispatch(store);

	// returned value to be used for setting field values
	useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/calendar',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ calendar: data });
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<Card className={globalStyles.card}>
				<CardHeader>
					<Text size="title">Calendar settings</Text>
				</CardHeader>
				<CardBody>
					<FormFieldSet>
						No fields here yet
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
