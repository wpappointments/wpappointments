import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import styles from './CancelAppointment.module.css';

type Props = {
	onConfirmClick: () => Promise<void>;
	closeModal: () => void;
};

export default function CancelAppointment({
	onConfirmClick,
	closeModal,
}: Props) {
	return (
		<Modal
			title={__('Cancel appointment?', 'wpappointments')}
			onRequestClose={closeModal}
			className={styles.modal}
		>
			<p>{__('This will cancel the appointment.', 'wpappointments')}</p>
			<div className={styles.modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Go back', 'wpappointments')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirmClick}
				>
					{__('Cancel appointment', 'wpappointments')}
				</Button>
			</div>
		</Modal>
	);
}
