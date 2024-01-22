import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { Text } from '~/utils/experimental';
import apiFetch from '~/utils/fetch';
import useFillFormValues from '~/hooks/useFillFormValues';
import { store } from '~/store/store';
import { formActions } from '../Settings.module.css';
import { HtmlForm, withForm } from '~/admin/components/Form/Form';
import Input from '~/admin/components/FormField/Input/Input';
import Select from '~/admin/components/FormField/Select/Select';
import FormFieldSet from '~/admin/components/FormFieldSet/FormFieldSet';
import { card } from 'global.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
	clockType: 12 | 24;
};

export default withForm<Fields>(function GeneralSettings() {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	useFillFormValues(settings);

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
			<HtmlForm onSubmit={onSubmit}>
				<CardBody>
					<FormFieldSet>
						<Input
							name="firstName"
							label="First name"
							placeholder="Eg. John"
							rules={{
								required: true,
							}}
						/>

						<Input
							name="lastName"
							label="Last name"
							placeholder="Eg. Doe"
							rules={{
								required: true,
							}}
						/>

						<Input
							name="phoneNumber"
							label="Phone number"
							placeholder="Eg. +1992334211"
						/>
					</FormFieldSet>
				</CardBody>
				<CardHeader>
					<Text size="title">General</Text>
				</CardHeader>
				<CardBody>
					<FormFieldSet>
						<Select
							name="clockType"
							label="Clock type"
							rules={{
								required: true,
							}}
							options={[
								{ label: '12 hours', value: '12' },
								{ label: '24 hours', value: '24' },
							]}
							defaultValue="24"
						/>
					</FormFieldSet>
				</CardBody>
				<CardFooter>
					<div className={formActions}>
						<Button type="submit" variant="primary">
							Save changes
						</Button>
					</div>
				</CardFooter>
			</HtmlForm>
		</Card>
	);
});
