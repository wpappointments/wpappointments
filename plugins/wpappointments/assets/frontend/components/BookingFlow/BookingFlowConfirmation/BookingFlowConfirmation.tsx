import { __ } from '@wordpress/i18n';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import styles from '../BookingFlow.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowConfirmation() {
	const { form } = useBookingFlowContext();
	const { getValues } = form;

	const dateTime = getValues('datetime');
	const date = formatDate(new Date(dateTime));
	const time = formatTime(new Date(dateTime));

	return (
		<div className={styles.alignLeft}>
			<h2>{__('Appointment created successfully!', 'wpappointments')}</h2>
			<p>
				{__(
					'Thank you for scheduling your appointment!',
					'wpappointments'
				)}
			</p>
			<p>
				<strong>{__('Details', 'wpappointments')}</strong>:
			</p>
			<strong>{__('Date', 'wpappointments')}</strong>: {date}
			<br />
			<strong>{__('Time', 'wpappointments')}</strong>: {time}
			<br />
		</div>
	);
}
