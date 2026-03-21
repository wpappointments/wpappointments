import { useFormContext } from 'react-hook-form';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { getSettings } from '@wordpress/date';
import { __, sprintf } from '@wordpress/i18n';
import {
	Checkbox,
	FormFieldSet,
	HtmlForm,
	Input,
	Radio,
	Select,
	withForm,
} from '@wpappointments/components';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import { format } from 'date-fns';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { dateFormatMap, timeFormatMap } from '~/backend/utils/i18n';
import resolve from '~/backend/utils/resolve';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import { store } from '~/backend/store/store';
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
			displayErrorToast(__('Error saving settings', 'wpappointments'));
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ general: data });
			displaySuccessToast(response.message);
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
						label={__('First name', 'wpappointments')}
						placeholder={__('Eg. John', 'wpappointments')}
					/>

					<Input
						name="lastName"
						label={__('Last name', 'wpappointments')}
						placeholder={__('Eg. Doe', 'wpappointments')}
					/>

					<Input
						name="email"
						label={__('Email', 'wpappointments')}
						type="email"
						placeholder="example@example.com"
					/>

					<Input
						name="phoneNumber"
						label={__('Phone number', 'wpappointments')}
						placeholder={__('Eg. +1992334211', 'wpappointments')}
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
						label={__('Week starts on', 'wpappointments')}
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
						label={__('Clock type', 'wpappointments')}
						rules={{
							required: true,
						}}
						options={[
							{
								label: __('12 hours', 'wpappointments'),
								value: '12',
							},
							{
								label: __('24 hours', 'wpappointments'),
								value: '24',
							},
						]}
					/>
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					<Checkbox
						name="timezoneSiteDefault"
						label={__(
							'Use site default timezone',
							'wpappointments'
						)}
						defaultValue={false}
					/>
					{!timezoneSiteDefault && (
						<div>
							<Select
								name="timezone"
								label={__('Timezone', 'wpappointments')}
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
								]}
							/>
						</div>
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
								]}
							/>
						</div>
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
					{__('Save changes', 'wpappointments')}
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
