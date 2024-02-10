import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import cn from '~/utils/cn';
import useSlideout from '~/hooks/useSlideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import {
	isPending,
	isConfirmed,
	isCancelled,
	isNoShow,
	statusPill,
} from './AppointmentDetails.module.css';
import { formActions } from '~/admin/components/AppointmentForm/AppointmentForm.module.css';
import CancelAppointment from '~/admin/components/Modals/CancelAppointment/CancelAppointment';
import DeleteAppointmentModal from '~/admin/components/Modals/DeleteAppointment/DeleteAppointment';
import { useStateContext } from '~/admin/context/StateContext';
import { appointmentsApi } from '~/api/appointments';

export default function AppointmentDetails() {
	const { invalidate } = useStateContext();
	const { deleteAppointment, cancelAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});
	const { currentSlideout, closeSlideOut } = useSlideout('view-appointment');
	const { openSlideOut } = useSlideout();
	const [appointmentId, setAppointmentId] = useState(0);

	const { data: selectedAppointment } = currentSlideout || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	if (!currentAppointment) {
		return null;
	}

	return (
		<>
			<div
				className={cn({
					[statusPill]: true,
					[isPending]: currentAppointment?.status === 'pending',
					[isConfirmed]: currentAppointment?.status === 'confirmed',
					[isCancelled]: currentAppointment?.status === 'cancelled',
					[isNoShow]: currentAppointment?.status === 'no-show',
				})}
			>
				{currentAppointment?.status}
			</div>
			<h2>{currentAppointment?.service}</h2>
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
				{currentAppointment.status === 'confirmed' && (
					<Button
						isDestructive
						onClick={() => {
							setAppointmentId(currentAppointment.id);
						}}
					>
						{__('Cancel Appointment')}
					</Button>
				)}
				{currentAppointment.status === 'cancelled' && (
					<Button
						isDestructive
						onClick={() => {
							setAppointmentId(currentAppointment.id);
						}}
					>
						{__('Delete Appointment')}
					</Button>
				)}
				{appointmentId > 0 && (
					<AppointmentDetailsModals
						status={currentAppointment.status}
						cancelAppointment={async () => {
							await cancelAppointment(appointmentId);
							setAppointmentId(0);
							closeSlideOut('view-appointment');
						}}
						deleteAppointment={async () => {
							await deleteAppointment(appointmentId);
							setAppointmentId(0);
							closeSlideOut('view-appointment');
						}}
						closeModal={() => {
							setAppointmentId(0);
						}}
					/>
				)}
			</div>
		</>
	);
}

type AppointmentDetailsModalsProps = {
	status: Appointment['status'];
	cancelAppointment: () => Promise<void>;
	deleteAppointment: () => Promise<void>;
	closeModal: () => void;
};

function AppointmentDetailsModals({
	status,
	cancelAppointment,
	deleteAppointment,
	closeModal,
}: AppointmentDetailsModalsProps) {
	if (status === 'confirmed') {
		return (
			<CancelAppointment
				onConfirmClick={cancelAppointment}
				closeModal={closeModal}
			/>
		);
	}

	if (status === 'cancelled') {
		return (
			<DeleteAppointmentModal
				onConfirmClick={deleteAppointment}
				closeModal={closeModal}
			/>
		);
	}

	return null;
}
