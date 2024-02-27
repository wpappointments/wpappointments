import { useFormContext } from 'react-hook-form';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { getSettings } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
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

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

function GeneralSettings() {
	const dispatch = useDispatch(store);

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
			displayErrorToast(error?.message);
			return;
		}

		if (response === null) {
			displayErrorToast('Error saving settings');
			return;
		}

		if (response.data.message) {
			dispatch.setPluginSettings({ general: data });
			displaySuccessToast(response.data.message);
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFields />
		</HtmlForm>
	);
}

function FormFields() {
	const { watch } = useFormContext();

	const timezoneSiteDefault = watch('timezoneSiteDefault');

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">Profile and company details</Text>
			</CardHeader>
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
			<CardHeader style={{ borderTop: '1px solid #eee', marginTop: 15 }}>
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
				<Button type="submit" variant="primary">
					Save changes
				</Button>
			</CardFooter>
		</Card>
	);
}

export default withForm(GeneralSettings);