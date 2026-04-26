import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import styles from './DeleteAppointments.module.css';

type Props = {
	onConfirmClick: () => Promise<void>;
	closeModal: () => void;
};

export default function DeleteAppointmentModal({
	onConfirmClick,
	closeModal,
}: Props) {
	return (
		<Modal
			title={__('Delete appointment?', 'appointments-booking')}
			onRequestClose={closeModal}
			className={styles.modal}
		>
			<p>
				{__(
					'This will permanently delete the appointment. It cannot be undone.',
					'appointments-booking'
				)}
			</p>
			<div className={styles.modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Go back', 'appointments-booking')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirmClick}
				>
					{__('Delete', 'appointments-booking')}
				</Button>
			</div>
		</Modal>
	);
}
