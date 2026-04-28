import { useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	TextareaControl,
	ToggleControl,
	__experimentalInputControl as InputControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	FormField,
	FormFieldSet,
	formFieldStyles,
} from '@wpappointments/components';
import {
	useSlideout,
	displayErrorToast,
	displaySuccessToast,
} from '@wpappointments/data';
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

type EventMeta = {
	title: string;
	description: string;
	defaultAdminSubject: string;
	defaultCustomerSubject: string;
	defaultAdminBody: string;
	defaultCustomerBody: string;
};

const EVENT_META: Record<NotificationEventKey, EventMeta> = {
	created: {
		title: __('Appointment Created', 'appointments-booking'),
		description: __(
			'Sent when a new appointment is booked.',
			'appointments-booking'
		),
		defaultAdminSubject: __(
			'New appointment booked',
			'appointments-booking'
		),
		defaultCustomerSubject: __(
			'Your appointment has been booked',
			'appointments-booking'
		),
		defaultAdminBody: __(
			`Dear {admin_first_name},

A new appointment has been booked with {customer_name}.

Date: {date}
Time: {time}
Service: {service}
Duration: {duration} minutes

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
		defaultCustomerBody: __(
			`Dear {customer_name},

Thank you for booking an appointment with us.

Date: {date}
Time: {time}
Service: {service}
Duration: {duration} minutes

If you need to reschedule, please contact us at {admin_email}.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
	},
	updated: {
		title: __('Appointment Updated', 'appointments-booking'),
		description: __(
			'Sent when an existing appointment is modified.',
			'appointments-booking'
		),
		defaultAdminSubject: __('Appointment updated', 'appointments-booking'),
		defaultCustomerSubject: __(
			'Your appointment has been updated',
			'appointments-booking'
		),
		defaultAdminBody: __(
			`Dear {admin_first_name},

The appointment with {customer_name} has been updated.

Previous: {previous_date} at {previous_time} ({previous_status})
Updated: {date} at {time} ({status})

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
		defaultCustomerBody: __(
			`Dear {customer_name},

Your appointment has been updated.

Previous: {previous_date} at {previous_time}
Updated: {date} at {time}
Status: {status}

If you have any questions, please contact us at {admin_email}.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
	},
	confirmed: {
		title: __('Appointment Confirmed', 'appointments-booking'),
		description: __(
			'Sent when an appointment is confirmed.',
			'appointments-booking'
		),
		defaultAdminSubject: __(
			'Appointment confirmed',
			'appointments-booking'
		),
		defaultCustomerSubject: __(
			'Your appointment is confirmed',
			'appointments-booking'
		),
		defaultAdminBody: __(
			`Dear {admin_first_name},

The appointment with {customer_name} on {date} at {time} has been confirmed.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
		defaultCustomerBody: __(
			`Dear {customer_name},

Your appointment on {date} at {time} is confirmed.

If you need to make any changes, please contact us at {admin_email}.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
	},
	cancelled: {
		title: __('Appointment Cancelled', 'appointments-booking'),
		description: __(
			'Sent when an appointment is cancelled.',
			'appointments-booking'
		),
		defaultAdminSubject: __(
			'Appointment cancelled',
			'appointments-booking'
		),
		defaultCustomerSubject: __(
			'Your appointment has been cancelled',
			'appointments-booking'
		),
		defaultAdminBody: __(
			`Dear {admin_first_name},

The appointment with {customer_name} on {date} at {time} has been cancelled.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
		defaultCustomerBody: __(
			`Dear {customer_name},

Your appointment on {date} at {time} has been cancelled.

If this was a mistake, please contact us at {admin_email} to reschedule.

Best regards,
{admin_first_name} {admin_last_name}`,
			'appointments-booking'
		),
	},
};

const TEMPLATE_VARS =
	'{id}, {service}, {status}, {date}, {time}, {duration}, {customer_name}, {previous_date}, {previous_time}, {previous_status}, {admin_first_name}, {admin_last_name}, {admin_email}, {admin_phone}';

function getDefaultEvent(key: NotificationEventKey): NotificationEvent {
	const meta = EVENT_META[key];
	return {
		enabled: true,
		sendToAdmin: true,
		sendToCustomer: true,
		customRecipients: '',
		adminSubject: meta.defaultAdminSubject,
		customerSubject: meta.defaultCustomerSubject,
		adminBody: meta.defaultAdminBody,
		customerBody: meta.defaultCustomerBody,
	};
}

/**
 * Merge saved/local values over defaults, treating empty strings as "unset"
 * so cleared text fields fall back to the default template instead of staying
 * blank in the editor.
 */
function mergeEvent(
	key: NotificationEventKey,
	...overrides: (Partial<NotificationEvent> | undefined)[]
): NotificationEvent {
	const result: NotificationEvent = getDefaultEvent(key);
	for (const override of overrides) {
		if (!override) continue;
		for (const [k, v] of Object.entries(override)) {
			if (v === '' || v === undefined) continue;
			(result as Record<string, unknown>)[k] = v;
		}
	}
	return result;
}

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
							? __('Active', 'appointments-booking')
							: __('Inactive', 'appointments-booking')}
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
				<Button
					variant="tertiary"
					onClick={onEdit}
					aria-label={`${__('Edit', 'appointments-booking')} ${meta.title}`}
				>
					{__('Edit', 'appointments-booking')}
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

			<FormFieldSet legend={__('Recipients', 'appointments-booking')}>
				<FormField>
					<ToggleControl
						label={__('Send to admin', 'appointments-booking')}
						checked={value.sendToAdmin}
						onChange={(v) => set('sendToAdmin', v)}
						__nextHasNoMarginBottom
					/>
				</FormField>
				<FormField>
					<ToggleControl
						label={__('Send to customer', 'appointments-booking')}
						checked={value.sendToCustomer}
						onChange={(v) => set('sendToCustomer', v)}
						__nextHasNoMarginBottom
					/>
				</FormField>
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{__(
							'Additional recipients (comma-separated)',
							'appointments-booking'
						)}
					</label>
					<InputControl
						value={value.customRecipients}
						onChange={(v) => set('customRecipients', v ?? '')}
						placeholder={__(
							'extra@example.com, other@example.com',
							'appointments-booking'
						)}
						size="__unstable-large"
					/>
				</FormField>
			</FormFieldSet>

			{value.sendToAdmin && (
				<FormFieldSet
					legend={__('Admin email', 'appointments-booking')}
				>
					<FormField>
						<label className={formFieldStyles.fieldLabel}>
							{__('Subject', 'appointments-booking')}
						</label>
						<InputControl
							value={value.adminSubject}
							onChange={(v) => set('adminSubject', v ?? '')}
							help={__(
								'Leave empty to use the default subject.',
								'appointments-booking'
							)}
							size="__unstable-large"
						/>
					</FormField>
					<FormField>
						<label className={formFieldStyles.fieldLabel}>
							{__('Body', 'appointments-booking')}
						</label>
						<TextareaControl
							help={
								__(
									'Leave empty to use the default template. Variables: ',
									'appointments-booking'
								) + TEMPLATE_VARS
							}
							value={value.adminBody}
							onChange={(v) => set('adminBody', v)}
							rows={8}
							__nextHasNoMarginBottom
						/>
					</FormField>
				</FormFieldSet>
			)}

			{value.sendToCustomer && (
				<FormFieldSet
					legend={__('Customer email', 'appointments-booking')}
				>
					<FormField>
						<label className={formFieldStyles.fieldLabel}>
							{__('Subject', 'appointments-booking')}
						</label>
						<InputControl
							value={value.customerSubject}
							onChange={(v) => set('customerSubject', v ?? '')}
							help={__(
								'Leave empty to use the default subject.',
								'appointments-booking'
							)}
							size="__unstable-large"
						/>
					</FormField>
					<FormField>
						<label className={formFieldStyles.fieldLabel}>
							{__('Body', 'appointments-booking')}
						</label>
						<TextareaControl
							help={
								__(
									'Leave empty to use the default template. Variables: ',
									'appointments-booking'
								) + TEMPLATE_VARS
							}
							value={value.customerBody}
							onChange={(v) => set('customerBody', v)}
							rows={8}
							__nextHasNoMarginBottom
						/>
					</FormField>
				</FormFieldSet>
			)}
		</div>
	);
}

export default function NotificationsSettings() {
	const dispatch = useDispatch(store);
	const { openSlideOut } = useSlideout();

	const savedSettings = useSelect((select) => {
		return select(store).getNotificationsSettings();
	}, []);

	const [localSettings, setLocalSettings] = useState<
		Partial<SettingsNotifications>
	>({});

	const getMerged = (): SettingsNotifications => ({
		created: mergeEvent(
			'created',
			savedSettings?.created,
			localSettings?.created
		),
		updated: mergeEvent(
			'updated',
			savedSettings?.updated,
			localSettings?.updated
		),
		confirmed: mergeEvent(
			'confirmed',
			savedSettings?.confirmed,
			localSettings?.confirmed
		),
		cancelled: mergeEvent(
			'cancelled',
			savedSettings?.cancelled,
			localSettings?.cancelled
		),
	});

	const merged = getMerged();

	const handleToggle =
		(key: NotificationEventKey) => async (enabled: boolean) => {
			const updatedEvent = { ...merged[key], enabled };

			setLocalSettings((prev) => ({
				...prev,
				[key]: updatedEvent,
			}));

			const allSettings = {
				...merged,
				[key]: updatedEvent,
			};

			const [error] = await resolve<Response>(async () => {
				return await apiFetch<Response>({
					path: 'settings/notifications',
					method: 'PATCH',
					data: allSettings,
				});
			});

			if (error) {
				setLocalSettings((prev) => ({
					...prev,
					[key]: { ...updatedEvent, enabled: !enabled },
				}));
				displayErrorToast(error?.message);
				return;
			}

			dispatch.setPluginSettings({ notifications: allSettings });
			setLocalSettings({});
		};

	const handleEdit = (key: NotificationEventKey) => () => {
		const meta = EVENT_META[key];
		const initialValues = mergeEvent(
			key,
			savedSettings?.[key],
			localSettings?.[key]
		);

		openSlideOut({
			id: `notification-${key}`,
			title: meta.title,
			content: (
				<NotificationEditorWrapper
					eventKey={key}
					initialValues={initialValues}
				/>
			),
		});
	};

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">
					{__('Email Notifications', 'appointments-booking')}
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
		</Card>
	);
}

function NotificationEditorWrapper({
	eventKey,
	initialValues,
}: {
	eventKey: NotificationEventKey;
	initialValues: NotificationEvent;
}) {
	const dispatch = useDispatch(store);
	const { closeSlideOut } = useSlideout();
	const [local, setLocal] = useState<NotificationEvent>(initialValues);
	const [saving, setSaving] = useState(false);

	const savedSettings = useSelect((select) => {
		return select(store).getNotificationsSettings();
	}, []);

	const handleSave = async () => {
		setSaving(true);

		const allSettings: SettingsNotifications = {
			created: mergeEvent('created', savedSettings?.created),
			updated: mergeEvent('updated', savedSettings?.updated),
			confirmed: mergeEvent('confirmed', savedSettings?.confirmed),
			cancelled: mergeEvent('cancelled', savedSettings?.cancelled),
			[eventKey]: local,
		};

		const [error, response] = await resolve<Response>(async () => {
			return await apiFetch<Response>({
				path: 'settings/notifications',
				method: 'PATCH',
				data: allSettings,
			});
		});

		setSaving(false);

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
			dispatch.setPluginSettings({ notifications: allSettings });
			displaySuccessToast(response.message);
			closeSlideOut(`notification-${eventKey}`);
		}
	};

	return (
		<>
			<NotificationEditor
				eventKey={eventKey}
				value={local}
				onChange={setLocal}
			/>
			<Button
				variant="primary"
				onClick={handleSave}
				isBusy={saving}
				style={{
					width: '100%',
					justifyContent: 'center',
					padding: '22px 0px',
					marginTop: '34px',
				}}
			>
				{__('Save changes', 'appointments-booking')}
			</Button>
		</>
	);
}
