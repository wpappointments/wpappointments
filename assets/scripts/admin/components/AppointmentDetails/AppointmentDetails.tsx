import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useAppointments } from '~/hooks/api/appointments';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { formActions } from '~/admin/components/AppointmentForm/AppointmentForm.module.css';
import DeleteAppointmentModal from '~/admin/components/Modals/DeleteAppointment/DeleteAppointment';

export default function AppointmentDetails() {
	const { deleteAppointment } = useAppointments();
	const { currentSlideout, closeSlideOut } = useSlideout('view-appointment');
	const { openSlideOut } = useSlideout();
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	if (!currentAppointment) {
		return null;
	}

	return (
		<>
			<h2>{currentAppointment?.title}</h2>
			<p>{currentAppointment?.date}</p>
			<p>{currentAppointment?.timeFromTo}</p>
			<div className={formActions}>
				<Button
					variant="primary"
					onClick={() => {
						openSlideOut({
							id: 'edit-appointment',
							parentId: 'view-appointment',
							data: selectedAppointment,
							level: 2,
						});
					}}
				>
					{__('Edit Appointment')}
				</Button>
				<Button
					isDestructive
					onClick={() => {
						setIsConfirmDeleteOpen(true);
					}}
				>
					{__('Delete Appointment')}
				</Button>
				{isConfirmDeleteOpen && (
					<DeleteAppointmentModal
						confirmDeleteAppointment={async () => {
							await deleteAppointment(currentAppointment.id);
							setIsConfirmDeleteOpen(false);
							closeSlideOut('view-appointment');
						}}
						closeModal={() => {
							setIsConfirmDeleteOpen(false);
						}}
					/>
				)}
			</div>
		</>
	);
}
