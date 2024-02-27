import { __ } from '@wordpress/i18n';
import styles from '../BookingFlow.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowConfirmation() {
	const { form } = useBookingFlowContext();
	const { getValues } = form;

	const dateTime = getValues('datetime');
	const date = new Date(dateTime).toLocaleDateString();
	const time = new Date(dateTime).toLocaleTimeString();
	const confirmationNumber = '123456';

	return (
		<div className={styles.alignLeft}>
			<h2>{__('Appointment created successfully!', 'wpappointments')}</h2>
			<p>Thank you for scheduling your appointment!</p>
			<p>
				<strong>Details</strong>:
			</p>
			<strong>Date</strong>: {date}
			<br />
			<strong>Time</strong>: {time}
			<br />
			<strong>Confirmation Number</strong>: {confirmationNumber}
			<br />
		</div>
	);
}
