import { Button, Modal, ToggleControl } from '@wordpress/components';
import { Appointment } from '~/types';
import { empty, emptyIcon, table } from './Table.module.css';
import { useState } from 'react';
import {
	modal,
	modalActions,
} from '../AppointmentForm/AppointmentForm.module.css';
import { __ } from '@wordpress/i18n';

type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	deleteAppointment: (id: number) => void;
};

export default function Table({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	deleteAppointment,
}: Props) {
	const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] =
		useState(false);
	const [deleteModalNotify, setDeleteModalNotify] = useState(true);

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
				{items.map(
					({
						id,
						time,
						date,
						timeFromTo,
						title,
						timestamp,
						actions,
					}) => (
						<tr key={id}>
							<td>
								<Button
									variant="link"
									onClick={() => {
										onView &&
											onView({
												id,
												time,
												date,
												timeFromTo,
												title,
												timestamp,
												actions,
											});
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
										onView &&
											onView({
												id,
												time,
												date,
												timeFromTo,
												title,
												timestamp,
												actions,
											});
									}}
								>
									View
								</Button>
								<Button
									variant="tertiary"
									size="small"
									onClick={() => {
										onEdit &&
											onEdit({
												id,
												time,
												date,
												timeFromTo,
												title,
												timestamp,
												actions,
											});
									}}
								>
									Edit
								</Button>
								<Button
									variant="tertiary"
									size="small"
									isDestructive
									onClick={() => {
										setDeleteConfirmationModalOpen(true);
									}}
								>
									Delete
								</Button>
								{deleteConfirmationModalOpen && (
									<Modal
										title="Delete appointment?"
										onRequestClose={() => {
											setDeleteConfirmationModalOpen(
												false
											);
										}}
										className={modal}
									>
										<p>
											{__(
												'This will permanently delete the appointment.',
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
											<Button
												variant="secondary"
												onClick={() => {
													setDeleteConfirmationModalOpen(
														false
													);
												}}
											>
												{__('Cancel', 'wpappointments')}
											</Button>
											<Button
												variant="primary"
												isDestructive
												onClick={async () => {
													deleteAppointment(id);
													setDeleteConfirmationModalOpen(
														false
													);
												}}
											>
												{__('Delete', 'wpappointments')}
											</Button>
										</div>
									</Modal>
								)}
							</td>
						</tr>
					)
				)}
			</tbody>
		</table>
	);
}
