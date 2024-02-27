import { __ } from '@wordpress/i18n';
import styles from '../BookingFlow.module.css';

export default function BookingFlowConfirmation() {
	return (
		<p className={styles.success}>
			✅ {__('Appointment created successfully', 'wpappointments')}
		</p>
	);
}
