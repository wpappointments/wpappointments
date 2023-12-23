import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import { store } from '~/store/store';
import { formActions } from '../Settings.module.css';
import Input from '~/admin/components/FormField/Input/Input';
import { card } from 'global.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
};

export default function GeneralSettings() {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Fields>();

	const dispatch = useDispatch(store);

	useSelect(() => {
		const appStore = select(store);
		const settings = appStore.getGeneralSettings();

		if ('firstName' in settings) {
			const { firstName, lastName, phoneNumber } = settings;

			setValue('firstName', firstName);
			setValue('lastName', lastName);
			setValue('phoneNumber', phoneNumber);
		}

		return settings;
	}, []);

	const onSubmit = async (data: Fields) => {
		await apiFetch({
			path: 'settings/general',
			method: 'PATCH',
			data,
		});

		dispatch.setPluginSettings({ general: data });
	};

	return (
		<Card className={card}>
			<CardHeader>
				<Text size="title">Profile and company details</Text>
			</CardHeader>
			<CardBody>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Input
						control={control}
						errors={errors}
						name="firstName"
						label="First name"
						placeholder="Eg. John"
						rules={{
							required: true,
						}}
					/>

					<Input
						control={control}
						errors={errors}
						name="lastName"
						label="Last name"
						placeholder="Eg. Doe"
						rules={{
							required: true,
						}}
					/>

					<Input
						control={control}
						errors={errors}
						name="phoneNumber"
						label="Phone number"
						placeholder="Eg. +1992334211"
					/>

					<div className={formActions}>
						<Button type="submit" variant="primary">
							Save changes
						</Button>
					</div>
				</form>
			</CardBody>
		</Card>
	);
}
