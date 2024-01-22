import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import { store } from '~/store/store';
import { formActions } from '../Settings.module.css';
import Form from '~/admin/components/Form/Form';
import Select from '~/admin/components/FormField/Select/Select';
import { card } from 'global.module.css';

type Fields = {
	timeSlotStep: number;
};

export default function CalendarSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Fields>();

	const dispatch = useDispatch(store);

	useSelect(() => {
		const appStore = select(store);
		const settings = appStore.getCalendarSettings();

		// set field values

		return settings;
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
		<Card className={card}>
			<CardHeader>
				<Text size="title">Calendar settings</Text>
			</CardHeader>
			<CardBody>
				<Form onSubmit={handleSubmit(onSubmit)}>
					No fields here yet
					<div className={formActions}>
						<Button type="submit" variant="primary">
							Save changes
						</Button>
					</div>
				</Form>
			</CardBody>
		</Card>
	);
}
