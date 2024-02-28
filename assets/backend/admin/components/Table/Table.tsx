import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addMinutes, fromUnixTime } from 'date-fns';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import styles from './Table.module.css';
import { AppointmentsApi } from '~/backend/api/appointments';


type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	onCancel?: (appointmentId: number) => void;
	deleteAppointment: AppointmentsApi['deleteAppointment'];
	cancelAppointment: AppointmentsApi['deleteAppointment'];
};

export default function Table({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	cancelAppointment,
	deleteAppointment,
}: Props) {
	const [appointmentModal, setAppointmentModal] = useState<{
		id: number;
		status: Appointment['status'];
	} | null>(null);

	if (!items || items.length === 0) {
		return (
			<div className={styles.empty}>
				<svg
					className={styles.emptyIcon}
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M839.2 101.3H184.9L65.3 539.5 64 922.7h896V549.3l-120.8-448zM241.9 176h540.3L884 549.3H678.7l-74.7 112H420l-74.7-112H140.1L241.9 176z" />
				</svg>
				<p>{__('You have no appointments yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={onEmptyStateButtonClick}>
					{__('Create New Appointment', 'wpappointments')}
				</Button>
			</div>
		);
	}

	return (
		<>
			<table className={styles.table}>
				<thead>
					<tr>
						<th>{__('Title', 'wpappointments')}</th>
						<th>{__('Date', 'wpappointments')}</th>
						<th>{__('Time', 'wpappointments')}</th>
						<th>{__('Status', 'wpappointments')}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{items.map((row) => (
						<TableRow
							key={row.id}
							row={row}
							edit={onEdit}
							view={onView}
							setAppointmentModal={setAppointmentModal}
						/>
					))}
				</tbody>
			</table>
			{appointmentModal && (
				<AppointmentDetailsModals
					status={appointmentModal.status}
					cancelAppointment={async () => {
						await cancelAppointment(appointmentModal.id);
						setAppointmentModal(null);
					}}
					deleteAppointment={async () => {
						await deleteAppointment(appointmentModal.id);
						setAppointmentModal(null);
					}}
					closeModal={() => {
						setAppointmentModal(null);
					}}
				/>
			)}
		</>
	);
}

type TableRowProps = {
	row: Appointment;
	edit?: (appointment: Appointment) => void;
	view?: (appointment: Appointment) => void;
	setAppointmentModal: Dispatch<SetStateAction<{
		id: number;
		status: Appointment['status'];
	} | null>>;
};

function TableRow({
	row,
	edit,
	view,
	setAppointmentModal,
}: TableRowProps) {
	const { id, service, timestamp, duration } = row;
	const dateStart = fromUnixTime(timestamp);
	const dateEnd = addMinutes(dateStart, duration);

	const dateOutput = dateStart.toLocaleDateString();

	const timeFrom = dateStart.toLocaleTimeString('pl-PL', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const timeTo = dateEnd.toLocaleTimeString('pl-PL', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const timeFromTo = `${timeFrom} - ${timeTo}`;

	const userDiffTimezone = userSiteTimezoneMatch();

	return (
		<tr key={id}>
			<td>
				<Button
					variant="link"
					onClick={() => {
						view && view(row);
					}}
				>
					<strong>{service}</strong>
				</Button>
				<br />
				{__('Customer', 'wpappointments')}:{' '}
				<strong>{row.customer.name}</strong>
			</td>
			<td>{dateOutput}</td>
			<td>
				{timeFromTo}
				{userDiffTimezone && ` (${userDiffTimezone})`}
			</td>
			<td>
				<span
					className={cn({
						[styles.status]: true,
						[styles[row.status]]: true,
					})}
				>
					{row.status}
				</span>
			</td>
			<td>
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						view && view(row);
					}}
				>
					{__('View', 'wpappointments')}
				</Button>
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						edit && edit(row);
					}}
				>
					{__('Edit', 'wpappointments')}
				</Button>
				{(row.status === 'confirmed' || row.status === 'pending') && (
					<Button
						variant="tertiary"
						size="small"
						isDestructive
						onClick={() => {
							setAppointmentModal({ id, status: row.status });
						}}
					>
						{__('Cancel', 'wpappointments')}
					</Button>
				)}
				{row.status === 'cancelled' && (
					<Button
						variant="tertiary"
						size="small"
						isDestructive
						onClick={() => {
							setAppointmentModal({ id, status: row.status });
						}}
					>
						{__('Delete', 'wpappointments')}
					</Button>
				)}
			</td>
		</tr>
	);
}