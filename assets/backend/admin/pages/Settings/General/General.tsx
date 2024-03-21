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
import { __, sprintf } from '@wordpress/i18n';
import { format } from 'date-fns';
import { Text } from '~/backend/utils/experimental';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { dateFormatMap, timeFormatMap } from '~/backend/utils/i18n';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Checkbox from '~/backend/admin/components/FormField/Checkbox/Checkbox';
import Input from '~/backend/admin/components/FormField/Input/Input';
import Radio from '~/backend/admin/components/FormField/Radio/Radio';
import Select from '~/backend/admin/components/FormField/Select/Select';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import globalStyles from 'global.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	phoneNumber: string;
	companyName: string;
	clockType: '12' | '24';
	startOfWeek: number;
	timezoneSiteDefault: boolean;
	timezone: string;
	dateFormat: string;
	customDateFormat: string;
	timeFormat: string;
	customTimeFormat: string;
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

	const dateFormat = watch('dateFormat');
	const timeFormat = watch('timeFormat');
	const timezoneSiteDefault = watch('timezoneSiteDefault');

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Profile and company details', 'wpappointments')}
				</Text>
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
				<Text size="title">{__('Calendar', 'wpappointments')}</Text>
			</CardHeader>
			<CardBody>
				<FormFieldSet>
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
			</CardBody>
			<CardHeader style={{ borderTop: '1px solid #eee', marginTop: 15 }}>
				<Text size="title">
					{__('Date and time', 'wpappointments')}
				</Text>
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
					/>
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					<Checkbox
						name="timezoneSiteDefault"
						label="Use site default timezone"
						defaultValue={false}
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
								{__(
									'Choose either a city in the same timezone as you or a UTC',
									'wpappointments'
								)}
							</small>
						</div>
					)}
					{timezoneSiteDefault && (
						<div>
							<small>
								{__(
									'Site default timezone is',
									'wpappointments'
								)}{' '}
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
							{__('Universal time is', 'wpappointments')}{' '}
							<code>
								<small>
									{_formatDate(new Date().toISOString())}
								</small>
							</code>
							.
						</small>
					</div>
					<div>
						<small>
							{__('Local time is', 'wpappointments')}{' '}
							<code>
								<small>
									{format(new Date(), 'yyyy-MM-dd HH:ii:ss')}
								</small>
							</code>
							.
						</small>
					</div>
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					<div>
						<div style={{ marginBottom: 15 }}>
							<Radio
								name="dateFormat"
								label={__('Date format', 'wpappointments')}
								defaultValue="F j, Y"
								options={[
									{
										label: format(
											new Date(),
											'MMMM d, yyyy'
										),
										value: 'F j, Y',
									},
									{
										label: format(new Date(), 'yyyy-MM-dd'),
										value: 'Y-m-d',
									},
									{
										label: format(new Date(), 'MM/dd/yyyy'),
										value: 'm/d/Y',
									},
									{
										label: format(new Date(), 'dd/MM/yyyy'),
										value: 'd/m/Y',
									},
									{ label: 'Custom', value: 'custom' },
								]}
							/>
						</div>
						{dateFormat === 'custom' && (
							<Input
								name="customDateFormat"
								label={__(
									'Custom date format',
									'wpappointments'
								)}
								placeholder="Eg. Y-m-d"
								rules={{
									required: true,
								}}
							/>
						)}
						{dateFormat &&
							dateFormatMap.get(dateFormat) &&
							sprintf(
								__('Preview: %s', 'wpappointments'),
								format(
									new Date(),
									dateFormatMap.get(dateFormat) ||
										'MMMM d, yyyy'
								)
							)}
					</div>
					{__(
						'Default date format is derived from WordPress site settings',
						'wpappointments'
					)}
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					<div>
						<div style={{ marginBottom: 15 }}>
							<Radio
								name="timeFormat"
								label={__('Time format', 'wpappointments')}
								defaultValue="g:i a"
								options={[
									{
										label: format(new Date(), 'h:mm aaa'),
										value: 'g:i a',
									},
									{
										label: format(new Date(), 'h:mm aa'),
										value: 'g:i A',
									},
									{
										label: format(new Date(), 'HH:mm'),
										value: 'H:i',
									},
									{ label: 'Custom', value: 'custom' },
								]}
							/>
						</div>
						{timeFormat === 'custom' && (
							<Input
								name="customTimeFormat"
								label={__(
									'Custom time format',
									'wpappointments'
								)}
								placeholder="Eg. g:i a"
								rules={{
									required: true,
								}}
							/>
						)}
						{timeFormat &&
							timeFormatMap.get(timeFormat) &&
							sprintf(
								__('Preview: %s', 'wpappointments'),
								format(
									new Date(),
									timeFormatMap.get(timeFormat || '') ||
										'g:i a'
								)
							)}
					</div>
					{__(
						'Default time format is derived from WordPress site settings',
						'wpappointments'
					)}
					<a
						href="https://wordpress.org/documentation/article/customize-date-and-time-format/"
						target="_blank"
					>
						{__(
							'Documentation on date and time formatting.',
							'wpappointments'
						)}
					</a>
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

function _formatDate(date: string) {
	const offsetDate = new Date(
		new Date(date).setMinutes(
			new Date(date).getMinutes() + new Date(date).getTimezoneOffset()
		)
	);

	return format(offsetDate, 'yyyy-MM-dd HH:mm:ss');
}

export default withForm(GeneralSettings);
