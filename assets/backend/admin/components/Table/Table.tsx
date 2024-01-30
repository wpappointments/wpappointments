import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Appointment } from '~/types';
import { empty, emptyIcon, table } from './Table.module.css';
import CancelAppointment from '~/admin/components/Modals/CancelAppointment/CancelAppointment';
import { AppointmentsApi } from '~/api/appointments';

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
}: Props) {
	const [appointmentId, setAppointmentId] = useState(0);

	if (!items || items.length === 0) {
		return (
			<div className={empty}>
				<svg
					className={emptyIcon}
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M839.2 101.3H184.9L65.3 539.5 64 922.7h896V549.3l-120.8-448zM241.9 176h540.3L884 549.3H678.7l-74.7 112H420l-74.7-112H140.1L241.9 176z" />
				</svg>
				<p>You have no appointments yet</p>
				<Button variant="primary" onClick={onEmptyStateButtonClick}>
					Create New Appointment
				</Button>
			</div>
		);
	}

	return (
		<>
			<table className={table}>
				<thead>
					<tr>
						<th>Title</th>
						<th>Date</th>
						<th>Time</th>
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
							setAppointmentId={setAppointmentId}
						/>
					))}
				</tbody>
			</table>
			{appointmentId > 0 && (
				<CancelAppointment
					onConfirmClick={async () => {
						await cancelAppointment(appointmentId);
						setAppointmentId(0);
					}}
					closeModal={() => {
						setAppointmentId(0);
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
	setAppointmentId: Dispatch<SetStateAction<number>>;
};

function TableRow({ row, edit, view, setAppointmentId }: TableRowProps) {
	const { id, title, date, timeFromTo } = row;

	return (
		<tr key={id}>
			<td>
				<Button
					variant="link"
					onClick={() => {
						view && view(row);
					}}
				>
					{title}
				</Button>
			</td>
			<td>{date}</td>
			<td>{timeFromTo}</td>
			<td>
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						view && view(row);
					}}
				>
					View
				</Button>
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						edit && edit(row);
					}}
				>
					Edit
				</Button>
				{row.status === 'active' && (
					<Button
						variant="tertiary"
						size="small"
						isDestructive
						onClick={() => {
							setAppointmentId(id);
						}}
					>
						Cancel
					</Button>
				)}
				{row.status === 'cancelled' && (
					<Button
						variant="tertiary"
						size="small"
						isDestructive
						onClick={() => {
							setAppointmentId(id);
						}}
					>
						Delete
					</Button>
				)}
			</td>
		</tr>
	);
}
