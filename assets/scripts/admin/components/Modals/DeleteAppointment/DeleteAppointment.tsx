import { useState } from 'react';
import { Modal, ToggleControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { modal, modalActions } from './DeleteAppointments.module.css';

type Props = {
	confirmDeleteAppointment: () => Promise<void>;
	closeModal: () => void;
};

export default function DeleteAppointmentModal({
	confirmDeleteAppointment,
	closeModal,
}: Props) {
	const [deleteModalNotify, setDeleteModalNotify] = useState(true);

	return (
		<Modal
			title="Delete appointment?"
			onRequestClose={closeModal}
			className={modal}
		>
			<p>
				{__(
					'This appo will permanently delete the appointment.',
					'wpappointments'
				)}
			</p>
			<ToggleControl
				onChange={(e) => {
					setDeleteModalNotify(e);
				}}
				checked={deleteModalNotify}
				label={__(
					'Notify customer about the cancellation',
					'wpappointments'
				)}
			/>
			<div className={modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Cancel', 'wpappointments')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={confirmDeleteAppointment}
				>
					{__('Delete', 'wpappointments')}
				</Button>
			</div>
		</Modal>
	);
}
