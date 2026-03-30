import { useEffect, useMemo, useState } from 'react';
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
	CheckboxInput,
	DataForm,
	FormFieldSet,
	RadioInput,
	SelectInput,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import { format } from 'date-fns';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import { dateFormatMap, timeFormatMap } from '~/backend/utils/i18n';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import globalStyles from 'global.module.css';

type Fields = {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	companyName: string;
	clockType: '12' | '24';
	startOfWeek: string;
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

const profileFields: Field<Fields>[] = [
	{
		id: 'firstName',
		type: 'text',
		label: __('First name', 'wpappointments'),
		Edit: TextInput,
	},
	{
		id: 'lastName',
		type: 'text',
		label: __('Last name', 'wpappointments'),
		Edit: TextInput,
	},
	{
		id: 'email',
		type: 'email',
		label: __('Email', 'wpappointments'),
		Edit: TextInput,
	},
	{
		id: 'phoneNumber',
		type: 'telephone',
		label: __('Phone number', 'wpappointments'),
		Edit: TextInput,
	},
	{
		id: 'companyName',
		type: 'text',
		label: __('Company name', 'wpappointments'),
		Edit: TextInput,
	},
];

const profileForm: Form = {
	layout: { type: 'regular' },
	fields: ['firstName', 'lastName', 'email', 'phoneNumber', 'companyName'],
};

const calendarFields: Field<Fields>[] = [
	{
		id: 'startOfWeek',
		label: __('Week starts on', 'wpappointments'),
		isValid: { required: true },
		elements: [
			{ label: __('Sunday', 'wpappointments'), value: '0' },
			{ label: __('Monday', 'wpappointments'), value: '1' },
			{ label: __('Tuesday', 'wpappointments'), value: '2' },
			{ label: __('Wednesday', 'wpappointments'), value: '3' },
			{ label: __('Thursday', 'wpappointments'), value: '4' },
			{ label: __('Friday', 'wpappointments'), value: '5' },
			{ label: __('Saturday', 'wpappointments'), value: '6' },
		],
		Edit: SelectInput,
	},
];

const calendarForm: Form = {
	layout: { type: 'regular' },
	fields: ['startOfWeek'],
};

const dateTimeForm: Form = {
	layout: { type: 'regular' },
	fields: ['clockType', 'timezoneSiteDefault', 'timezone'],
};

const dateFormatFields: Field<Fields>[] = [
	{
		id: 'dateFormat',
		label: __('Date format', 'wpappointments'),
		elements: [
			{
				label: format(new Date(), 'MMMM d, yyyy'),
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
		],
		Edit: RadioInput,
	},
];

const dateFormatForm: Form = {
	layout: { type: 'regular' },
	fields: ['dateFormat'],
};

const timeFormatFields: Field<Fields>[] = [
	{
		id: 'timeFormat',
		label: __('Time format', 'wpappointments'),
		elements: [
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
		],
		Edit: RadioInput,
	},
];

const timeFormatForm: Form = {
	layout: { type: 'regular' },
	fields: ['timeFormat'],
};

export default function GeneralSettings() {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const [formData, setFormData] = useState<Fields>(() => ({
		firstName: settings?.firstName ?? '',
		lastName: settings?.lastName ?? '',
		email: settings?.email ?? '',
		phoneNumber: settings?.phoneNumber ?? '',
		companyName: settings?.companyName ?? '',
		clockType: settings?.clockType ?? '24',
		startOfWeek: String(
			settings?.startOfWeek ?? getSettings().l10n.startOfWeek
		),
		timezoneSiteDefault: settings?.timezoneSiteDefault ?? false,
		timezone: settings?.timezone ?? '',
		dateFormat: settings?.dateFormat ?? 'F j, Y',
		customDateFormat: settings?.customDateFormat ?? '',
		timeFormat: settings?.timeFormat ?? 'g:i a',
		customTimeFormat: settings?.customTimeFormat ?? '',
	}));

	useEffect(() => {
		if (!settings) return;
		setFormData({
			firstName: settings.firstName ?? '',
			lastName: settings.lastName ?? '',
			email: settings.email ?? '',
			phoneNumber: settings.phoneNumber ?? '',
			companyName: settings.companyName ?? '',
			clockType: settings.clockType ?? '24',
			startOfWeek: String(
				settings.startOfWeek ?? getSettings().l10n.startOfWeek
			),
			timezoneSiteDefault: settings.timezoneSiteDefault ?? false,
			timezone: settings.timezone ?? '',
			dateFormat: settings.dateFormat ?? 'F j, Y',
			customDateFormat: settings.customDateFormat ?? '',
			timeFormat: settings.timeFormat ?? 'g:i a',
			customTimeFormat: settings.customTimeFormat ?? '',
		});
	}, [settings]);

	const handleChange = (edits: Record<string, unknown>) => {
		setFormData((prev) => ({ ...prev, ...edits }));
	};

	const dateTimeFields: Field<Fields>[] = useMemo(
		() => [
			{
				id: 'clockType',
				label: __('Clock type', 'wpappointments'),
				isValid: { required: true },
				elements: [
					{
						label: __('12 hours', 'wpappointments'),
						value: '12',
					},
					{
						label: __('24 hours', 'wpappointments'),
						value: '24',
					},
				],
				Edit: SelectInput,
			},
			{
				id: 'timezoneSiteDefault',
				type: 'boolean',
				label: __('Use site default timezone', 'wpappointments'),
				Edit: CheckboxInput,
			},
			{
				id: 'timezone',
				label: __('Timezone', 'wpappointments'),
				isValid: { required: true },
				isVisible: () => !formData.timezoneSiteDefault,
				elements: window.wpappointments.date.timezones.map(
					(timezone) => ({
						label: timezone,
						value: timezone,
					})
				),
				Edit: SelectInput,
			},
		],
		[formData.timezoneSiteDefault]
	);

	const allFields = [
		...profileFields,
		...calendarFields,
		...dateTimeFields,
		...dateFormatFields,
		...timeFormatFields,
	];

	const allForm: Form = {
		layout: { type: 'regular' },
		fields: allFields.map((f) => f.id),
	};

	const { validity, isValid } = useFormValidity(formData, allFields, allForm);

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			const response = await apiFetch<Response>({
				path: 'settings/general',
				method: 'PATCH',
				data: formData,
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
			dispatch.setPluginSettings({
				general: {
					...formData,
					startOfWeek: Number(formData.startOfWeek),
				},
			});
			displaySuccessToast(response.message);
		}
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Profile and company details', 'wpappointments')}
				</Text>
			</CardHeader>
			<CardBody>
				<FormFieldSet>
					<DataForm
						data={formData}
						fields={profileFields}
						form={profileForm}
						onChange={handleChange}
						validity={validity}
					/>
				</FormFieldSet>
			</CardBody>
			<CardHeader style={{ borderTop: '1px solid #eee', marginTop: 15 }}>
				<Text size="title">{__('Calendar', 'wpappointments')}</Text>
			</CardHeader>
			<CardBody>
				<FormFieldSet>
					<DataForm
						data={formData}
						fields={calendarFields}
						form={calendarForm}
						onChange={handleChange}
						validity={validity}
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
					<DataForm
						data={formData}
						fields={dateTimeFields}
						form={dateTimeForm}
						onChange={handleChange}
						validity={validity}
					/>
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					{formData.timezoneSiteDefault && (
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
					{!formData.timezoneSiteDefault && (
						<div>
							<small>
								{__(
									'Choose either a city in the same timezone as you or a UTC',
									'wpappointments'
								)}
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
									{format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
								</small>
							</code>
							.
						</small>
					</div>
				</FormFieldSet>
				<FormFieldSet style={{ marginBottom: 25 }}>
					<div>
						<div style={{ marginBottom: 15 }}>
							<DataForm
								data={formData}
								fields={dateFormatFields}
								form={dateFormatForm}
								onChange={handleChange}
								validity={validity}
							/>
						</div>
						{formData.dateFormat &&
							dateFormatMap.get(formData.dateFormat) &&
							sprintf(
								__('Preview: %s', 'wpappointments'),
								format(
									new Date(),
									dateFormatMap.get(formData.dateFormat) ||
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
							<DataForm
								data={formData}
								fields={timeFormatFields}
								form={timeFormatForm}
								onChange={handleChange}
								validity={validity}
							/>
						</div>
						{formData.timeFormat &&
							timeFormatMap.get(formData.timeFormat) &&
							sprintf(
								__('Preview: %s', 'wpappointments'),
								format(
									new Date(),
									timeFormatMap.get(
										formData.timeFormat || ''
									) || 'g:i a'
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
						rel="noopener noreferrer"
					>
						{__(
							'Documentation on date and time formatting.',
							'wpappointments'
						)}
					</a>
				</FormFieldSet>
			</CardBody>
			<CardFooter>
				<Button
					variant="primary"
					onClick={onSubmit}
					disabled={!isValid}
				>
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
