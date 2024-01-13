import { useState } from 'react';
import { Modal, ToggleControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { modal, modalActions, notify } from './CancelAppointment.module.css';

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
			className={modal}
		>
			<p>{__('This will cancel the appointment.', 'wpappointments')}</p>
			<div className={notify}>
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
			<div className={modalActions}>
				<Button variant="secondary" onClick={closeModal}>
					{__('Go back', 'wpappointments')}
				</Button>
				<Button
					variant="primary"
					isDestructive
					onClick={onConfirmClick}
				>
					{__('Cancel appointment', 'wpappointments')}
					{shouldNotify &&
						' ' +
							__('and', 'wpappointments') +
							' ' +
							__('notify customer', 'wpappointments')}
				</Button>
			</div>
		</Modal>
	);
}
