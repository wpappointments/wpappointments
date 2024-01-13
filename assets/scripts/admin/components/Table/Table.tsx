import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { UseAppointments } from 'global';
import { Appointment } from '~/types';
import DeleteAppointmentModal from '../Modals/DeleteAppointment/DeleteAppointment';
import { empty, emptyIcon, table } from './Table.module.css';

type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	onCancel?: (appointmentId: number) => void;
	deleteAppointment: UseAppointments['deleteAppointment'];
};

export default function Table({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	onCancel,
	deleteAppointment,
}: Props) {
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(0);

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
							cancel={onCancel}
							setIsConfirmDeleteOpen={setIsConfirmDeleteOpen}
						/>
					))}
				</tbody>
			</table>
			{isConfirmDeleteOpen > 0 && (
				<DeleteAppointmentModal
					confirmDeleteAppointment={async () => {
						await deleteAppointment(isConfirmDeleteOpen);
						setIsConfirmDeleteOpen(0);
					}}
					closeModal={() => {
						setIsConfirmDeleteOpen(0);
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
	cancel?: (appointmentId: number) => void;
	setIsConfirmDeleteOpen: Dispatch<SetStateAction<number>>;
};

function TableRow({
	row,
	edit,
	view,
	cancel,
	setIsConfirmDeleteOpen,
}: TableRowProps) {
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
				<Button
					variant="tertiary"
					size="small"
					isDestructive
					onClick={() => {
						cancel && cancel(row.id);
					}}
				>
					Cancel
				</Button>
				<Button
					variant="tertiary"
					size="small"
					isDestructive
					onClick={() => {
						setIsConfirmDeleteOpen(id);
					}}
				>
					Delete
				</Button>
			</td>
		</tr>
	);
}
