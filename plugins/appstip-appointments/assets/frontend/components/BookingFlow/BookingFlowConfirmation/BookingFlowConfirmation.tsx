import { __ } from '@wordpress/i18n';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import styles from '../BookingFlow.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowConfirmation() {
	const { formData } = useBookingFlowContext();

	const dateTime = formData.datetime;
	const date = formatDate(new Date(dateTime));
	const time = formatTime(new Date(dateTime));

	return (
		<div className={styles.alignLeft} role="status" aria-live="polite">
			<h2>
				{__(
					'Appointment created successfully!',
					'appstip-appointments'
				)}
			</h2>
			<p>
				{__(
					'Thank you for scheduling your appointment!',
					'appstip-appointments'
				)}
			</p>
			<p>
				<strong>{__('Details', 'appstip-appointments')}</strong>:
			</p>
			<strong>{__('Date', 'appstip-appointments')}</strong>: {date}
			<br />
			<strong>{__('Time', 'appstip-appointments')}</strong>: {time}
			<br />
		</div>
	);
}
