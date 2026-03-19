import { useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	PanelBody,
	PanelRow,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { displayErrorToast, displaySuccessToast } from '~/backend/utils/toast';
import type {
	NotificationEvent,
	SettingsNotifications,
} from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import globalStyles from 'global.module.css';

type Response = APIResponse<{
	data: Partial<SettingsNotifications>;
	message: string;
}>;

const EVENT_LABELS: Record<keyof SettingsNotifications, string> = {
	created: __('Appointment created', 'wpappointments'),
	updated: __('Appointment updated', 'wpappointments'),
	confirmed: __('Appointment confirmed', 'wpappointments'),
	cancelled: __('Appointment cancelled', 'wpappointments'),
};

const TEMPLATE_VARS =
	'{id}, {service}, {status}, {date}, {duration}, {customer_name}';

const DEFAULT_EVENT: NotificationEvent = {
	enabled: true,
	sendToAdmin: true,
	sendToCustomer: true,
	customRecipients: '',
	subject: '',
	body: '',
};

function EventPanel({
	label,
	value,
	onChange,
}: {
	label: string;
	value: NotificationEvent;
	onChange: (updated: NotificationEvent) => void;
}) {
	const set = <K extends keyof NotificationEvent>(
		key: K,
		val: NotificationEvent[K]
	) => {
		onChange({ ...value, [key]: val });
	};

	return (
		<PanelBody title={label} initialOpen={false}>
			<PanelRow>
				<ToggleControl
					label={__('Enable this notification', 'wpappointments')}
					checked={value.enabled}
					onChange={(v) => set('enabled', v)}
				/>
			</PanelRow>
			{value.enabled && (
				<>
					<PanelRow>
						<ToggleControl
							label={__('Send to admin', 'wpappointments')}
							checked={value.sendToAdmin}
							onChange={(v) => set('sendToAdmin', v)}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Send to customer', 'wpappointments')}
							checked={value.sendToCustomer}
							onChange={(v) => set('sendToCustomer', v)}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__(
								'Additional recipients (comma-separated)',
								'wpappointments'
							)}
							value={value.customRecipients}
							onChange={(v) => set('customRecipients', v)}
							placeholder="extra@example.com, other@example.com"
						/>
					</PanelRow>
					<PanelRow>
						<TextControl
							label={__('Custom subject', 'wpappointments')}
							help={__(
								'Leave empty to use the default subject.',
								'wpappointments'
							)}
							value={value.subject}
							onChange={(v) => set('subject', v)}
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl
							label={__('Custom email body', 'wpappointments')}
							help={
								__(
									'Leave empty to use the default body. Available variables: ',
									'wpappointments'
								) + TEMPLATE_VARS
							}
							value={value.body}
							onChange={(v) => set('body', v)}
							rows={6}
						/>
					</PanelRow>
				</>
			)}
		</PanelBody>
	);
}

export default function NotificationsSettings() {
	const dispatch = useDispatch(store);

	const savedSettings = useSelect(() => {
		return select(store).getNotificationsSettings();
	}, []);

	const [localSettings, setLocalSettings] = useState<
		Partial<SettingsNotifications>
	>({});

	const merged = {
		created: {
			...DEFAULT_EVENT,
			...savedSettings?.created,
			...localSettings?.created,
		},
		updated: {
			...DEFAULT_EVENT,
			...savedSettings?.updated,
			...localSettings?.updated,
		},
		confirmed: {
			...DEFAULT_EVENT,
			...savedSettings?.confirmed,
			...localSettings?.confirmed,
		},
		cancelled: {
			...DEFAULT_EVENT,
			...savedSettings?.cancelled,
			...localSettings?.cancelled,
		},
	} as SettingsNotifications;

	const handleChange =
		(key: keyof SettingsNotifications) => (val: NotificationEvent) => {
			setLocalSettings((prev) => ({ ...prev, [key]: val }));
		};

	const onSave = async () => {
		const [error, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/notifications',
				method: 'PATCH',
				data: merged,
			});
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
			dispatch.setPluginSettings({ notifications: merged });
			setLocalSettings({});
			displaySuccessToast(response.message);
		}
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Email Notifications', 'wpappointments')}
				</Text>
			</CardHeader>
			<CardBody style={{ padding: 0 }}>
				{(
					Object.keys(EVENT_LABELS) as Array<
						keyof SettingsNotifications
					>
				).map((key) => (
					<EventPanel
						key={key}
						label={EVENT_LABELS[key]}
						value={merged[key]}
						onChange={handleChange(key)}
					/>
				))}
			</CardBody>
			<CardFooter>
				<Button variant="primary" onClick={onSave}>
					{__('Save changes', 'wpappointments')}
				</Button>
			</CardFooter>
		</Card>
	);
}
