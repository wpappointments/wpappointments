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
		<div className={styles.alignLeft}>
			<h2>
				{__(
					'Appointment created successfully!',
					'appointments-booking'
				)}
			</h2>
			<p>
				{__(
					'Thank you for scheduling your appointment!',
					'appointments-booking'
				)}
			</p>
			<p>
				<strong>{__('Details', 'appointments-booking')}</strong>:
			</p>
			<strong>{__('Date', 'appointments-booking')}</strong>: {date}
			<br />
			<strong>{__('Time', 'appointments-booking')}</strong>: {time}
			<br />
		</div>
	);
}
