import { useFormContext } from 'react-hook-form';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import apiFetch from '~/backend/utils/fetch';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import formStyles from '~/backend/admin/components/AppointmentForm/AppointmentForm.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Checkbox from '~/backend/admin/components/FormField/Checkbox/Checkbox';
import Input from '~/backend/admin/components/FormField/Input/Input';
import Select from '~/backend/admin/components/FormField/Select/Select';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import globalStyles from 'global.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
	clockType: 12 | 24;
	startOfWeek: number;
	timezoneSiteDefault: boolean;
	timezone: string;
};

function GeneralSettings() {
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
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">Profile and company details</Text>
			</CardHeader>
			<HtmlForm onSubmit={onSubmit}>
				<FormFields />
			</HtmlForm>
		</Card>
	);
}

function FormFields() {
	const { watch } = useFormContext();

	const timezoneSiteDefault = watch('timezoneSiteDefault');

	return (
		<>
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
						name="email"
						label="Email"
						placeholder="example@example.com"
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
				<FormFieldSet style={{ marginBottom: 15 }}>
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
				<FormFieldSet style={{ marginBottom: 15 }}>
					<Select
						name="startOfWeek"
						label="Week starts on"
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
				</FormFieldSet>
				<FormFieldSet>
					<Checkbox
						name="timezoneSiteDefault"
						label="Use site default timezone"
						defaultValue={true}
					/>
					{!timezoneSiteDefault && (
						<div>
							<Select
								name="timezone"
								label="Timezone"
								rules={{
									required: true,
								}}
								options={window.wpappointments.date.timezones.map(
									(timezone) => {
										return {
											label: timezone,
											value: timezone,
										};
									}
								)}
								defaultValue="24"
							/>
							<small>
								Choose either a city in the same timezone as you
								or a UTC
							</small>
						</div>
					)}
					{timezoneSiteDefault && (
						<div>
							<small>
								Site default timezone is{' '}
								<code>
									<small>
										{
											window.wpappointments.date
												.siteTimezone
										}
									</small>
								</code>
								.
							</small>
						</div>
					)}
					<div>
						<small>
							Universal time is{' '}
							<code>
								<small>2024-02-25 10:35:18</small>
							</code>
							.
						</small>
					</div>
					<div>
						<small>
							Local time is{' '}
							<code>
								<small>2024-02-25 11:35:18</small>
							</code>
							.
						</small>
					</div>
				</FormFieldSet>
			</CardBody>
			<CardFooter>
				<div className={formStyles.formActions}>
					<Button type="submit" variant="primary">
						Save changes
					</Button>
				</div>
			</CardFooter>
		</>
	);
}

export default withForm(GeneralSettings);
