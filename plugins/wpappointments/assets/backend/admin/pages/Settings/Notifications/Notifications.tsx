import { useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	TextareaControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useSlideout } from '@wpappointments/data';
import { displayErrorToast, displaySuccessToast } from '@wpappointments/data';
import apiFetch, { APIResponse } from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import type {
	NotificationEvent,
	NotificationEventKey,
	SettingsNotifications,
} from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import styles from './Notifications.module.css';
import globalStyles from 'global.module.css';

type Response = APIResponse<{
	data: Partial<SettingsNotifications>;
	message: string;
}>;

const EVENT_META: Record<
	NotificationEventKey,
	{ title: string; description: string }
> = {
	created: {
		title: __('Appointment Created', 'wpappointments'),
		description: __(
			'Sent when a new appointment is booked.',
			'wpappointments'
		),
	},
	updated: {
		title: __('Appointment Updated', 'wpappointments'),
		description: __(
			'Sent when an existing appointment is modified.',
			'wpappointments'
		),
	},
	confirmed: {
		title: __('Appointment Confirmed', 'wpappointments'),
		description: __(
			'Sent when an appointment is confirmed.',
			'wpappointments'
		),
	},
	cancelled: {
		title: __('Appointment Cancelled', 'wpappointments'),
		description: __(
			'Sent when an appointment is cancelled.',
			'wpappointments'
		),
	},
};

const TEMPLATE_VARS =
	'{id}, {service}, {status}, {date}, {time}, {duration}, {customer_name}, {previous_date}, {previous_time}, {previous_status}, {admin_first_name}, {admin_last_name}, {admin_email}, {admin_phone}';

const DEFAULT_EVENT: NotificationEvent = {
	enabled: true,
	sendToAdmin: true,
	sendToCustomer: true,
	customRecipients: '',
	adminSubject: '',
	customerSubject: '',
	adminBody: '',
	customerBody: '',
};

function NotificationRow({
	eventKey,
	value,
	onToggle,
	onEdit,
}: {
	eventKey: NotificationEventKey;
	value: NotificationEvent;
	onToggle: (enabled: boolean) => void;
	onEdit: () => void;
}) {
	const meta = EVENT_META[eventKey];

	return (
		<div className={styles.notificationRow}>
			<div className={styles.notificationInfo}>
				<div className={styles.notificationHeader}>
					<span className={styles.notificationTitle}>
						{meta.title}
					</span>
					<span
						className={
							value.enabled
								? styles.badgeActive
								: styles.badgeInactive
						}
					>
						{value.enabled
							? __('Active', 'wpappointments')
							: __('Inactive', 'wpappointments')}
					</span>
				</div>
				<span className={styles.notificationDescription}>
					{meta.description}
				</span>
			</div>
			<div className={styles.notificationActions}>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={value.enabled}
					onChange={onToggle}
					label={meta.title}
					className={styles.srOnlyLabel}
				/>
				<Button variant="tertiary" onClick={onEdit}>
					{__('Edit', 'wpappointments')}
				</Button>
			</div>
		</div>
	);
}

function NotificationEditor({
	eventKey,
	value,
	onChange,
}: {
	eventKey: NotificationEventKey;
	value: NotificationEvent;
	onChange: (updated: NotificationEvent) => void;
}) {
	const meta = EVENT_META[eventKey];

	const set = <K extends keyof NotificationEvent>(
		key: K,
		val: NotificationEvent[K]
	) => {
		onChange({ ...value, [key]: val });
	};

	return (
		<div className={styles.editorContent}>
			<p className={styles.editorDescription}>{meta.description}</p>

			<div className={styles.editorSection}>
				<h3 className={styles.editorSectionTitle}>
					{__('Recipients', 'wpappointments')}
				</h3>
				<ToggleControl
					label={__('Send to admin', 'wpappointments')}
					checked={value.sendToAdmin}
					onChange={(v) => set('sendToAdmin', v)}
				/>
				<ToggleControl
					label={__('Send to customer', 'wpappointments')}
					checked={value.sendToCustomer}
					onChange={(v) => set('sendToCustomer', v)}
				/>
				<TextControl
					label={__(
						'Additional recipients (comma-separated)',
						'wpappointments'
					)}
					value={value.customRecipients}
					onChange={(v) => set('customRecipients', v)}
					placeholder={__(
						'extra@example.com, other@example.com',
						'wpappointments'
					)}
				/>
			</div>

			{value.sendToAdmin && (
				<div className={styles.editorSection}>
					<h3 className={styles.editorSectionTitle}>
						{__('Admin email', 'wpappointments')}
					</h3>
					<TextControl
						label={__('Subject', 'wpappointments')}
						help={__(
							'Leave empty to use the default subject.',
							'wpappointments'
						)}
						value={value.adminSubject}
						onChange={(v) => set('adminSubject', v)}
					/>
					<TextareaControl
						label={__('Body', 'wpappointments')}
						help={
							__(
								'Leave empty to use the default template. Variables: ',
								'wpappointments'
							) + TEMPLATE_VARS
						}
						value={value.adminBody}
						onChange={(v) => set('adminBody', v)}
						rows={8}
					/>
				</div>
			)}

			{value.sendToCustomer && (
				<div className={styles.editorSection}>
					<h3 className={styles.editorSectionTitle}>
						{__('Customer email', 'wpappointments')}
					</h3>
					<TextControl
						label={__('Subject', 'wpappointments')}
						help={__(
							'Leave empty to use the default subject.',
							'wpappointments'
						)}
						value={value.customerSubject}
						onChange={(v) => set('customerSubject', v)}
					/>
					<TextareaControl
						label={__('Body', 'wpappointments')}
						help={
							__(
								'Leave empty to use the default template. Variables: ',
								'wpappointments'
							) + TEMPLATE_VARS
						}
						value={value.customerBody}
						onChange={(v) => set('customerBody', v)}
						rows={8}
					/>
				</div>
			)}
		</div>
	);
}

export default function NotificationsSettings() {
	const dispatch = useDispatch(store);
	const { openSlideOut } = useSlideout();

	const savedSettings = useSelect(() => {
		return select(store).getNotificationsSettings();
	}, []);

	const [localSettings, setLocalSettings] = useState<
		Partial<SettingsNotifications>
	>({});

	const getMerged = () =>
		({
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
		}) as SettingsNotifications;

	const merged = getMerged();

	const handleToggle = (key: NotificationEventKey) => (enabled: boolean) => {
		setLocalSettings((prev) => ({
			...prev,
			[key]: { ...merged[key], ...prev?.[key], enabled },
		}));
	};

	const handleChange =
		(key: NotificationEventKey) => (val: NotificationEvent) => {
			setLocalSettings((prev) => ({ ...prev, [key]: val }));
		};

	const handleEdit = (key: NotificationEventKey) => () => {
		const meta = EVENT_META[key];

		openSlideOut({
			id: `notification-${key}`,
			title: meta.title,
			content: (
				<NotificationEditorWrapper
					eventKey={key}
					getSettings={() => ({
						...DEFAULT_EVENT,
						...savedSettings?.[key],
						...localSettings?.[key],
					})}
					onChange={handleChange(key)}
				/>
			),
		});
	};

	const onSave = async () => {
		const current = getMerged();
		const [error, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/notifications',
				method: 'PATCH',
				data: current,
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
			dispatch.setPluginSettings({ notifications: current });
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
				<div className={styles.notificationList}>
					{(Object.keys(EVENT_META) as NotificationEventKey[]).map(
						(key) => (
							<NotificationRow
								key={key}
								eventKey={key}
								value={merged[key]}
								onToggle={handleToggle(key)}
								onEdit={handleEdit(key)}
							/>
						)
					)}
				</div>
			</CardBody>
			<CardFooter>
				<Button variant="primary" onClick={onSave}>
					{__('Save changes', 'wpappointments')}
				</Button>
			</CardFooter>
		</Card>
	);
}

function NotificationEditorWrapper({
	eventKey,
	getSettings,
	onChange,
}: {
	eventKey: NotificationEventKey;
	getSettings: () => NotificationEvent;
	onChange: (val: NotificationEvent) => void;
}) {
	const [local, setLocal] = useState<NotificationEvent>(getSettings());

	const handleChange = (updated: NotificationEvent) => {
		setLocal(updated);
		onChange(updated);
	};

	return (
		<NotificationEditor
			eventKey={eventKey}
			value={local}
			onChange={handleChange}
		/>
	);
}
