import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import styles from './Delete.module.css';

type Props = {
	title: string;
	message: string;
	onConfirmClick: () => Promise<void>;
	closeModal: () => void;
};

export default function DeleteAppointmentModal({
	title,
	message,
	onConfirmClick,
	closeModal,
}: Props) {
	return (
		<Modal
			title={title}
			onRequestClose={closeModal}
			className={styles.modal}
		>
			<p>{message}</p>
			<div className={styles.modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Go back', 'wpappointments')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirmClick}
				>
					{__('Delete', 'wpappointments')}
				</Button>
			</div>
		</Modal>
	);
}
