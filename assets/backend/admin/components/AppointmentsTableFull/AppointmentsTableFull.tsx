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
			id: 'title',
			header: __('Title', 'wpappointments'),
			render: ({ item }) => {
				return (
					<>
						<Button
							variant="link"
							onClick={() => {
								onView && onView(item);
							}}
							style={{ marginBottom: '5px' }}
						>
							<strong>{item.service}</strong>
						</Button>
						<br />
						{__('Customer', 'wpappointments')}:{' '}
						<strong>{item.customer.name}</strong>
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'date',
			header: __('Date', 'wpappointments'),
			render: ({ item }) => {
				return <>{formatDate(item.timestamp)}</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'time',
			header: __('Time', 'wpappointments'),
			render: ({ item }) => {
				const { timestamp, duration } = item;
				const dateStart = fromUnixTime(timestamp);
				const dateEnd = addMinutes(dateStart, duration);

				const timeFrom = formatTime(dateStart);
				const timeTo = formatTime(dateEnd);
				const timeFromTo = `${timeFrom} - ${timeTo}`;

				const userDiffTimezone = userSiteTimezoneMatch();

				return (
					<>
						{timeFromTo}
						{userDiffTimezone && ` (${userDiffTimezone})`}
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'status',
			header: __('Status', 'wpappointments'),
			render: ({ item }) => {
				return (
					<>
						<span
							className={cn({
								[styles.status]: true,
								[styles[item.status]]: true,
							})}
						>
							{item.status}
						</span>
					</>
				);
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
			label: __('View appointment details', 'wpappointments'),
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
