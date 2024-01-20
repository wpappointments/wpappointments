import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import { store } from '~/store/store';
import { formActions } from '../Settings.module.css';
import Form from '~/admin/components/Form/Form';
import Input from '~/admin/components/FormField/Input/Input';
import { card } from 'global.module.css';

type Fields = {
	defaultLength: number;
};

export default function AppointmentsSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Fields>();

	const dispatch = useDispatch(store);

	useSelect(() => {
		const appStore = select(store);
		const settings = appStore.getAppointmentsSettings();

		if ('defaultLength' in settings) {
			setValue('defaultLength', settings.defaultLength);
		}

		return settings;
	}, []);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/appointments',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ appointments: data });
	};

	return (
		<Card className={card}>
			<CardHeader>
				<Text size="title">Appointments Settings</Text>
			</CardHeader>
			<CardBody>
				<Form onSubmit={handleSubmit(onSubmit)}>
					<Input
						control={control}
						errors={errors}
						name="defaultLength"
						label="Default appointment length (in minutes)"
						placeholder=""
						rules={{
							required: true,
						}}
					/>

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
