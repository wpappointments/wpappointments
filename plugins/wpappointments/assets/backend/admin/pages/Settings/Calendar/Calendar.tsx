import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { FormFieldSet } from '@wpappointments/components';
import apiFetch from '~/backend/utils/fetch';
import { store } from '~/backend/store/store';
import formStyles from '~/backend/admin/components/AppointmentForm/AppointmentForm.module.css';
import globalStyles from 'global.module.css';

export default function CalendarSettings() {
	const dispatch = useDispatch(store);

	useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const onSubmit = async () => {
		const data = {};

		await apiFetch({
			path: 'settings/calendar',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ calendar: data });
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Calendar settings', 'wpappointments')}
				</Text>
			</CardHeader>
			<CardBody>
				<FormFieldSet>
					{__('No fields here yet', 'wpappointments')}
					<div className={formStyles.formActions}>
						<Button onClick={onSubmit} variant="primary">
							{__('Save changes', 'wpappointments')}
						</Button>
					</div>
				</FormFieldSet>
			</CardBody>
		</Card>
	);
}
