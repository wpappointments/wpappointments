import { useState } from 'react';
import { Modal, ToggleControl, Button } from '@wordpress/components';
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
	const [shouldNotify, setShouldNotify] = useState(true);

	return (
		<Modal
			title="Cancel appointment?"
			onRequestClose={closeModal}
			className={styles.modal}
		>
			<p>{__('This will cancel the appointment.', 'wpappointments')}</p>
			<div className={styles.notify}>
				<ToggleControl
					onChange={(e) => {
						setShouldNotify(e);
					}}
					checked={shouldNotify}
					label={__(
						'Notify customer about the cancellation',
						'wpappointments'
					)}
				/>
			</div>
			<div className={styles.modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Go back', 'wpappointments')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirmClick}
				>
					{!shouldNotify &&
						__('Cancel appointment', 'wpappointments')}
					{shouldNotify &&
						__('Cancel appointment and notify', 'wpappointments')}
				</Button>
			</div>
		</Modal>
	);
}
