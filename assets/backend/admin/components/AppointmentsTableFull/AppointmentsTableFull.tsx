import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	info,
	edit as editIcon,
	cancelCircleFilled,
	trash,
} from '@wordpress/icons';
import { addMinutes, fromUnixTime } from 'date-fns';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import styles from './AppointmentsTableFull.module.css';
import { AppointmentsApi } from '~/backend/api/appointments';

type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	onCancel?: (appointmentId: number) => void;
	deleteAppointment?: AppointmentsApi['deleteAppointment'];
	cancelAppointment?: AppointmentsApi['deleteAppointment'];
	hideActions?: boolean;
	hideHeader?: boolean;
	hideEmptyStateButton?: boolean;
	emptyStateMessage?: string;
};

export default function AppointmentsTableFull({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	cancelAppointment,
	deleteAppointment,
	hideActions = false,
	hideHeader = false,
	hideEmptyStateButton = false,
	emptyStateMessage,
}: Props) {
	const [appointmentModal, setAppointmentModal] = useState<{
		id: number;
		status: Appointment['status'];
	} | null>(null);

	if (!items || items.length === 0) {
		return (
			<div className={styles.empty}>
				<div>
					<svg
						className={styles.emptyIcon}
						viewBox="0 0 1024 1024"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M839.2 101.3H184.9L65.3 539.5 64 922.7h896V549.3l-120.8-448zM241.9 176h540.3L884 549.3H678.7l-74.7 112H420l-74.7-112H140.1L241.9 176z" />
					</svg>
					<p>
						{emptyStateMessage ||
							__(
								'You have no appointments yet',
								'wpappointments'
							)}
					</p>
					{!hideEmptyStateButton && (
						<Button
							variant="primary"
							onClick={onEmptyStateButtonClick}
						>
							{__('Create New Appointment', 'wpappointments')}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<table className={styles.table}>
				{!hideHeader && (
					<thead>
						<tr>
							<th>{__('Title', 'wpappointments')}</th>
							<th>{__('Date', 'wpappointments')}</th>
							<th>{__('Time', 'wpappointments')}</th>
							<th>{__('Status', 'wpappointments')}</th>
							{!hideActions && <th style={{ width: 80 }}></th>}
						</tr>
					</thead>
				)}
				<tbody>
					{items.map((row) => (
						<TableRow
							key={row.id}
							row={row}
							edit={onEdit}
							view={onView}
							setAppointmentModal={setAppointmentModal}
							hideActions={hideActions}
						/>
					))}
				</tbody>
			</table>
			{appointmentModal && (
				<AppointmentDetailsModals
					status={appointmentModal.status}
					cancelAppointment={async () => {
						if (!cancelAppointment) {
							return;
						}

						await cancelAppointment(appointmentModal.id);
						setAppointmentModal(null);
					}}
					deleteAppointment={async () => {
						if (!deleteAppointment) {
							return;
						}

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
	setAppointmentModal: Dispatch<
		SetStateAction<{
			id: number;
			status: Appointment['status'];
		} | null>
	>;
	hideActions?: boolean;
};

function TableRow({
	row,
	edit,
	view,
	setAppointmentModal,
	hideActions = false,
}: TableRowProps) {
	const { id, service, timestamp, duration } = row;
	const dateStart = fromUnixTime(timestamp);
	const dateEnd = addMinutes(dateStart, duration);

	const timeFrom = formatTime(dateStart);
	const timeTo = formatTime(dateEnd);
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
					style={{ marginBottom: '5px' }}
				>
					<strong>{service}</strong>
				</Button>
				<br />
				{__('Customer', 'wpappointments')}:{' '}
				<strong>{row.customer.name}</strong>
			</td>
			<td>{formatDate(timestamp)}</td>
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
			{!hideActions && (
				<td className={styles.actionsTableCell}>
					<Button
						variant="tertiary"
						size="small"
						onClick={() => {
							view && view(row);
						}}
						icon={<Icon icon={info} />}
						label={__('View appointment details', 'wpappointments')}
					/>
					<Button
						variant="tertiary"
						size="small"
						onClick={() => {
							edit && edit(row);
						}}
						icon={<Icon icon={editIcon} />}
						label={__('Edit appointment details', 'wpappointments')}
					/>
					{(row.status === 'confirmed' ||
						row.status === 'pending') && (
						<Button
							variant="tertiary"
							size="small"
							isDestructive
							onClick={() => {
								setAppointmentModal({ id, status: row.status });
							}}
							icon={<Icon icon={cancelCircleFilled} />}
							label={__('Cancel appointment', 'wpappointments')}
						/>
					)}
					{row.status === 'cancelled' && (
						<Button
							variant="tertiary"
							size="small"
							isDestructive
							onClick={() => {
								setAppointmentModal({ id, status: row.status });
							}}
							icon={<Icon icon={trash} />}
							label={__('Delete appointment', 'wpappointments')}
						/>
					)}
				</td>
			)}
		</tr>
	);
}
