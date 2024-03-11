import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, info, edit as editIcon, cancelCircleFilled, check, trash } from '@wordpress/icons';
import { addMinutes, fromUnixTime } from 'date-fns';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDate, formatDateRelative, formatTime } from '~/backend/utils/i18n';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import styles from './AppointmentsTableFull.module.css';
import Empty from '~/backend/admin/components/TableFull/Empty/Empty';
import Table from '~/backend/admin/components/TableFull/Table/Table';
import { AppointmentsApi } from '~/backend/api/appointments';


type Props = {
	items?: Appointment[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Appointment) => void;
	onView?: (appointment: Appointment) => void;
	onCancel?: (appointmentId: number) => void;
	deleteAppointment?: AppointmentsApi['deleteAppointment'];
	cancelAppointment?: AppointmentsApi['deleteAppointment'];
	confirmAppointment?: AppointmentsApi['confirmAppointment'];
	hideActions?: boolean;
	hideHeader?: boolean;
	hideEmptyStateButton?: boolean;
	emptyStateMessage?: string;
	totalItems?: number;
	totalPages?: number;
	perPage?: number;
};

export default function AppointmentsTableFull({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	confirmAppointment,
	cancelAppointment,
	deleteAppointment,
	hideActions = false,
	hideHeader = false,
	hideEmptyStateButton = false,
	emptyStateMessage,
	totalItems = 0,
	totalPages = 0,
	perPage = 10,
}: Props) {
	const [appointmentModal, setAppointmentModal] = useState<{
		id: number;
		status: Appointment['status'];
	} | null>(null);

	if (!items || items.length === 0) {
		return (
			<Empty>
				<p>
					{emptyStateMessage ||
						__('You have no appointments yet', 'wpappointments')}
				</p>
				{!hideEmptyStateButton && (
					<Button variant="primary" onClick={onEmptyStateButtonClick}>
						{__('Create New Appointment', 'wpappointments')}
					</Button>
				)}
			</Empty>
		);
	}

	const fields = [
		{
			id: 'status',
			header: __('Status'),
			getValue: ({ item }) => item.status,
			render: ({ item }) => {
				return (
					<>
						{item.status === 'pending' && (
							<span
								className={cn({
									[styles.pending]: true,
								})}
								title={__('Pending', 'wpappointments')}
							></span>
						)}
						{item.status === 'confirmed' && (
							<span
								className={cn({
									[styles.status]: true,
									[styles.confirmed]: true,
								})}
								title={__('Confirmed', 'wpappointments')}
							></span>
						)}
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'title',
			header: __('Title'),
			getValue: ({ item }) => item.service,
			render: ({ item }) => {
				return (
					<>
						{item.service} - {item.customer.name}
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'date',
			header: __('Date'),
			getValue: ({ item }) => item.dateStart,
			render: ({ item }) => {
				const dateStart = fromUnixTime(item.timestamp);
				const userDiffTimezone = userSiteTimezoneMatch();
				return (
					<>
						{formatDateRelative(dateStart, new Date())}
						{userDiffTimezone && ` (${userDiffTimezone})`}
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'duration',
			header: __('Duration'),
			getValue: ({ item }) => item.duration,
			render: ({ item }) => {
				return <>{item.duration} min</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const view = {
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: perPage,
		page: 1,
	};

	const actions = [
		{
			id: 'view',
			icon: 'info-outline',
			isPrimary: true,
			label: __('View', 'wpappointments'),
			callback: (item: Appointment) => {
				onView && onView(item);
			},
		},
	];
	const paginationInfo = {
		totalItems: totalItems || null,
		totalPages: totalPages || null,
		perPage: perPage,
	};

	return (
		<>
			<DataViews
				view={view}
				onChangeView={() => {}}
				fields={fields}
				actions={actions}
				data={items}
				paginationInfo={paginationInfo}
				search={false}
				supportedLayouts="table"
			/>
		</>
	);

	return (
		<>
			<Table>
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
							confirmAppointment={async () => {
								if (!confirmAppointment) {
									return;
								}

								await confirmAppointment(row.id);
							}}
							setAppointmentModal={setAppointmentModal}
							hideActions={hideActions}
						/>
					))}
				</tbody>
			</Table>
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
	confirmAppointment?: (appointmentId: number) => void;
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
	confirmAppointment,
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
					{row.status === 'confirmed' && (
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
					{row.status === 'pending' && (
						<Button
							variant="tertiary"
							size="small"
							onClick={() => {
								confirmAppointment &&
									confirmAppointment(row.id);
							}}
							icon={<Icon icon={check} />}
							label={__('Confirm appointment', 'wpappointments')}
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
