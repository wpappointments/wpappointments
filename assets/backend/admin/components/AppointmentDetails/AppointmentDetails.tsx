import { useState } from 'react';
import { Button, Icon } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { addMinutes } from 'date-fns';
import cn from '~/backend/utils/cn';
import { formatTimeForPicker } from '~/backend/utils/format';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import SummaryCustomer from '../CustomerSelector/Summary/Summary';
import SlideOut from '../SlideOut/SlideOut';
import SummaryTime from '../TimeSelector/Summary/Summary';
import styles from './AppointmentDetails.module.css';
import formStyles from '~/backend/admin/components/AppointmentForm/AppointmentForm.module.css';
import CancelAppointment from '~/backend/admin/components/Modals/CancelAppointment/CancelAppointment';
import DeleteAppointmentModal from '~/backend/admin/components/Modals/DeleteAppointment/DeleteAppointment';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { appointmentsApi } from '~/backend/api/appointments';


export default function AppointmentDetails() {
	const { invalidate } = useStateContext();
	const { deleteAppointment, cancelAppointment, confirmAppointment } =
		appointmentsApi({
			invalidateCache: invalidate,
		});
	const { currentSlideout, closeSlideOut, openSlideOut } = useSlideout({
		id: 'view-appointment',
	});
	const [appointmentId, setAppointmentId] = useState(0);

	const { data } = currentSlideout || {};
	const { selectedAppointment } = (data as any) || {};

	const currentAppointment = useSelect(() => {
		return select(store).getAppointment(selectedAppointment as number);
	}, [selectedAppointment]);

	if (!currentAppointment) {
		return null;
	}

	const { id, status, duration, service, customer } = currentAppointment;

	const start = new Date(currentAppointment.timestamp * 1000);
	const timeHourStart = formatTimeForPicker(start.getHours());
	const timeMinuteStart = formatTimeForPicker(start.getMinutes());
	const timeHourEnd = formatTimeForPicker(
		addMinutes(start, currentAppointment.duration).getHours()
	);
	const timeMinuteEnd = formatTimeForPicker(
		addMinutes(start, currentAppointment.duration).getMinutes()
	);

	return (
		<SlideOut
			title={__('Appointment', 'wpappointments')}
			id="view-appointment"
		>
			<div
				className={cn({
					[styles.statusPill]: true,
					[styles.isPending]: status === 'pending',
					[styles.isConfirmed]: status === 'confirmed',
					[styles.isCancelled]: status === 'cancelled',
					[styles.isNoshow]: status === 'noshow',
				})}
			>
				{__('Status', 'wpappointments')}:{' '}
				<span>
					{status} {getStatusEmoji(status)}
				</span>
			</div>
			<small className={styles.serviceLabel}>
				{__('Service', 'wpappointments')}:
			</small>
			<h2 className={styles.title}>{service}</h2>
			<div className={styles.details}>
				<SummaryTime
					date={start}
					timeHourStart={timeHourStart}
					timeMinuteStart={timeMinuteStart}
					timeHourEnd={timeHourEnd}
					timeMinuteEnd={timeMinuteEnd}
					duration={duration}
				/>
				{customer && <SummaryCustomer customer={customer} />}
			</div>
			<div className={formStyles.formActions}>
				<Button
					variant="primary"
					onClick={() => {
						openSlideOut({
							id: 'appointment',
							data: {
								selectedAppointment: selectedAppointment,
								mode: 'edit',
							},
						});
					}}
				>
					{__('Edit Appointment', 'wpappointments')}
				</Button>
				{status === 'confirmed' && (
					<Button
						isDestructive
						onClick={() => {
							setAppointmentId(id);
						}}
					>
						{__('Cancel Appointment', 'wpappointments')}
					</Button>
				)}
				{status === 'cancelled' && (
					<Button
						isDestructive
						onClick={() => {
							setAppointmentId(id);
						}}
					>
						{__('Delete Appointment', 'wpappointments')}
					</Button>
				)}
				{status === 'pending' && (
					<Button
						onClick={() => {
							confirmAppointment(id);
							closeSlideOut('view-appointment');
						}}
						icon={<Icon icon={check} />}
					>
						{__('Confirm Appointment', 'wpappointments')}
					</Button>
				)}
				{appointmentId > 0 && (
					<AppointmentDetailsModals
						status={status}
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
		</SlideOut>
	);
}

type AppointmentDetailsModalsProps = {
	status: Appointment['status'];
	cancelAppointment: () => Promise<void>;
	deleteAppointment: () => Promise<void>;
	closeModal: () => void;
};

export function AppointmentDetailsModals({
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

function getStatusEmoji(status: Appointment['status']) {
	if (status === 'confirmed') {
		return '✅';
	}

	if (status === 'cancelled') {
		return '❌';
	}

	if (status === 'noshow') {
		return '🚷';
	}

	return '⏳';
}
