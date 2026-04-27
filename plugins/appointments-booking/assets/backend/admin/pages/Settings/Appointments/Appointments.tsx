import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
} from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	DataForm,
	FormFieldSet,
	NumberInput,
	SelectInput,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type {
	DataFormControlProps,
	Field,
	Form,
} from '@wpappointments/components';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type { LeadTimeUnit } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import globalStyles from 'global.module.css';

type Fields = {
	defaultLength: number;
	timePickerPrecision: number;
	coreEntityName: string;
	defaultStatus: 'confirmed' | 'pending';
	minLeadTimeValue: number;
	minLeadTimeUnit: LeadTimeUnit;
	maxLeadTimeValue: number;
	maxLeadTimeUnit: LeadTimeUnit;
};

const LEAD_TIME_UNIT_OPTIONS = [
	{ label: __('Minutes', 'appointments-booking'), value: 'minute' },
	{ label: __('Hours', 'appointments-booking'), value: 'hour' },
	{ label: __('Days', 'appointments-booking'), value: 'day' },
	{ label: __('Weeks', 'appointments-booking'), value: 'week' },
	{ label: __('Months', 'appointments-booking'), value: 'month' },
];

type Response = APIResponse<{
	data: Fields;
	message: string;
}>;

const fields: Field<Fields>[] = [
	{
		id: 'coreEntityName',
		type: 'text',
		label: __('Service Name', 'appointments-booking'),
		placeholder: __('Appointment', 'appointments-booking'),
		Edit: TextInput,
	},
	{
		id: 'defaultLength',
		type: 'integer',
		label: __(
			'Default appointment length (in minutes)',
			'appointments-booking'
		),
		isValid: { min: 1 },
		Edit: NumberInput,
	},
	{
		id: 'timePickerPrecision',
		type: 'integer',
		label: __('Time picker precision (in minutes)', 'appointments-booking'),
		isValid: { min: 1, max: 60 * 24 },
		Edit: NumberInput,
	},
	{
		id: 'minLeadTimeValue',
		type: 'integer',
		label: __('Minimum lead time', 'appointments-booking'),
		isValid: { min: 0 },
		Edit: NumberInput,
	},
	{
		id: 'minLeadTimeUnit',
		label: __('Minimum lead time unit', 'appointments-booking'),
		elements: LEAD_TIME_UNIT_OPTIONS,
		Edit: (props: DataFormControlProps<Fields>) => (
			<SelectInput {...props} labelInvisible />
		),
	},
	{
		id: 'maxLeadTimeValue',
		type: 'integer',
		label: __('Maximum lead time', 'appointments-booking'),
		description: __('Leave at 0 for no limit.', 'appointments-booking'),
		isValid: { min: 0 },
		Edit: NumberInput,
	},
	{
		id: 'maxLeadTimeUnit',
		label: __('Maximum lead time unit', 'appointments-booking'),
		elements: LEAD_TIME_UNIT_OPTIONS,
		Edit: (props: DataFormControlProps<Fields>) => (
			<SelectInput {...props} labelInvisible />
		),
	},
	{
		id: 'defaultStatus',
		label: __('Default appointment status', 'appointments-booking'),
		description: __(
			'Default status for appointments created by your clients. You can change the status of each appointment individually.',
			'appointments-booking'
		),
		elements: [
			{
				label: __('Confirmed', 'appointments-booking'),
				value: 'confirmed',
			},
			{ label: __('Pending', 'appointments-booking'), value: 'pending' },
		],
		Edit: SelectInput,
	},
];

const form: Form = {
	layout: { type: 'regular' },
	fields: [
		'coreEntityName',
		'defaultLength',
		'timePickerPrecision',
		{
			id: 'minLeadTime',
			layout: { type: 'row', alignment: 'start' },
			children: ['minLeadTimeValue', 'minLeadTimeUnit'],
		},
		{
			id: 'maxLeadTime',
			layout: { type: 'row', alignment: 'start' },
			children: ['maxLeadTimeValue', 'maxLeadTimeUnit'],
		},
		'defaultStatus',
	],
};

export default function AppointmentsSettings() {
	const dispatch = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getAppointmentsSettings();
	}, []);

	const [formData, setFormData] = useState<Fields>(() => ({
		coreEntityName: settings?.coreEntityName ?? '',
		defaultLength: settings?.defaultLength ?? 30,
		timePickerPrecision: settings?.timePickerPrecision ?? 15,
		defaultStatus: settings?.defaultStatus ?? 'confirmed',
		minLeadTimeValue: settings?.minLeadTimeValue ?? 0,
		minLeadTimeUnit: settings?.minLeadTimeUnit ?? 'minute',
		maxLeadTimeValue: settings?.maxLeadTimeValue ?? 0,
		maxLeadTimeUnit: settings?.maxLeadTimeUnit ?? 'day',
	}));

	useEffect(() => {
		if (!settings) return;
		setFormData({
			coreEntityName: settings.coreEntityName ?? '',
			defaultLength: settings.defaultLength ?? 30,
			timePickerPrecision: settings.timePickerPrecision ?? 15,
			defaultStatus: settings.defaultStatus ?? 'confirmed',
			minLeadTimeValue: settings.minLeadTimeValue ?? 0,
			minLeadTimeUnit: settings.minLeadTimeUnit ?? 'minute',
			maxLeadTimeValue: settings.maxLeadTimeValue ?? 0,
			maxLeadTimeUnit: settings.maxLeadTimeUnit ?? 'day',
		});
	}, [settings]);

	const { validity, isValid } = useFormValidity(formData, fields, form);

	const onSubmit = async () => {
		if (!isValid) {
			return;
		}

		const [error, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/appointments',
				method: 'PATCH',
				data: formData,
			});
		});

		if (error) {
			displayErrorToast(error?.message);
			return;
		}

		if (response === null) {
			displayErrorToast(
				__('Error saving settings', 'appointments-booking')
			);
			return;
		}

		if (response.message) {
			dispatch.setPluginSettings({ appointments: formData });
			displaySuccessToast(response.message);
		}
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Appointments Settings', 'appointments-booking')}
				</Text>
			</CardHeader>
			<CardBody>
				<FormFieldSet>
					<DataForm
						data={formData}
						fields={fields}
						form={form}
						onChange={(edits) =>
							setFormData((prev) => ({ ...prev, ...edits }))
						}
						validity={validity}
					/>
				</FormFieldSet>
			</CardBody>
			<CardFooter>
				<Button
					onClick={onSubmit}
					disabled={!isValid}
					variant="primary"
				>
					{__('Save changes', 'appointments-booking')}
				</Button>
			</CardFooter>
		</Card>
	);
}
