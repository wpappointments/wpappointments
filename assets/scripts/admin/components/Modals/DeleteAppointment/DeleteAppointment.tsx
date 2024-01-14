import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { modal, modalActions } from './DeleteAppointments.module.css';

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
			title="Delete appointment?"
			onRequestClose={closeModal}
			className={modal}
		>
			<p>
				{__(
					'This will permanently delete the appointment. It cannot be undone.',
					'wpappointments'
				)}
			</p>
			<div className={modalActions}>
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
