import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { cancelCircleFilled, check, edit, Icon, info, trash } from '@wordpress/icons';
import { addMinutes, fromUnixTime } from 'date-fns';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import styles from './AppointmentsTableFull.module.css';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import { Action } from '~/backend/admin/components/DataViews/types';
import TableFullEmpty from '~/backend/admin/components/TableFullEmpty/TableFullEmpty';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { appointmentsApi } from '~/backend/api/appointments';
import { COLORS as colors } from '~/backend/constants';


type Fields = {
	status: Appointment['status'] | '';
	period: 'week' | 'month' | 'year' | 'all' | '';
	paged: number;
	posts_per_page: number;
};

type View = {
	type: 'table';
	layout: object;
	hiddenFields: [];
	perPage: number;
	page: number;
};

export default function AppointmentsTableFull() {
	const { openSlideOut } = useSlideout({
		id: 'appointment',
	});

	const [appointmentModal, setAppointmentModal] = useState<{
		id: number;
		status: Appointment['status'];
	} | null>(null);

	const { invalidate, getSelector } = useStateContext();
	const { deleteAppointment, cancelAppointment, confirmAppointment } =
		appointmentsApi({
			invalidateCache: invalidate,
		});
	const [filters, setFilters] = useState<Fields>({
		status: 'confirmed',
		period: 'week',
		paged: 1,
		posts_per_page: 10,
	});

	const { appointments, totalItems, totalPages, currentPage } =
		useSelect(() => {
			return select(store).getAppointments({
				...filters,
				version: getSelector('getAppointments'),
			});
		}, [filters, getSelector('getAppointments')]);

	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		page: currentPage,
		perPage: 10,
	});

	const addAppointment = () => {
		openSlideOut({
			id: 'appointment',
			data: {
				mode: 'create',
			},
		});
	};

	const editAppointment = (row: Appointment) => {
		openSlideOut({
			id: 'appointment',
			data: {
				selectedAppointment: row.id,
				mode: 'edit',
			},
		});
	};

	const viewAppointment = (row: Appointment) => {
		openSlideOut({
			id: 'view-appointment',
			data: {
				selectedAppointment: row.id,
			},
		});
	};

	if (!appointments || appointments.length === 0) {
		return (
			<TableFullEmpty>
				<p>{__('You have no appointments yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addAppointment}>
					{__('Create New Appointment', 'wpappointments')}
				</Button>
			</TableFullEmpty>
		);
	}

	const fields = [
		{
			id: 'title',
			header: __('Title', 'wpappointments'),
			render: ({ item }: { item: Appointment }) => {
				return (
					<>
						<Button
							variant="link"
							onClick={() => {
								viewAppointment && viewAppointment(item);
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
			render: ({ item }: { item: Appointment }) => {
				return <>{formatDate(item.timestamp)}</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'time',
			header: __('Time', 'wpappointments'),
			render: ({ item }: { item: Appointment }) => {
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
			render: ({ item }: { item: Appointment }) => {
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

	const actions: Action[] = [
		{
			id: 'view',
			icon: <Icon icon={info} color={colors.blue} />,
			isPrimary: true,
			label: __('View appointment details', 'wpappointments'),
			callback: (item: Appointment) => {
				viewAppointment && viewAppointment(item);
			},
		},
		{
			id: 'edit',
			icon: <Icon icon={edit} color={colors.blue} />,
			isPrimary: true,
			label: __('Edit appointment details', 'wpappointments'),
			callback: (item: Appointment) => {
				editAppointment && editAppointment(item);
			},
		},
		{
			id: 'cancel',
			isDestructive: true,
			icon: <Icon icon={cancelCircleFilled} color={colors.red} />,
			isPrimary: true,
			isEligible: (item: Appointment) => item.status === 'confirmed',
			label: __('Cancel appointment', 'wpappointments'),
			callback: (item: Appointment) => {
				const { id, status } = item;
				setAppointmentModal({ id, status });
			},
		},
		{
			id: 'confirm',
			icon: <Icon icon={check} color={colors.green} />,
			isPrimary: true,
			isEligible: (item: Appointment) => item.status === 'pending',
			label: __('Confirm appointment', 'wpappointments'),
			callback: (item: Appointment) => {
				confirmAppointment && confirmAppointment(item.id);
			},
		},
		{
			id: 'delete',
			icon: <Icon icon={trash} color={colors.red} />,
			isPrimary: true,
			isEligible: (item: Appointment) => item.status === 'cancelled',
			isDestructive: true,
			label: __('Delete appointment', 'wpappointments'),
			callback: (item: Appointment) => {
				const { id, status } = item;
				setAppointmentModal({ id, status });
			},
		},
	];

	const paginationInfo = {
		totalItems: totalItems,
		totalPages: totalPages,
	};

	return (
		<>
			<DataViews
				view={view}
				onChangeView={(currentState) => {
					setView(currentState);
					setFilters({
						...filters,
						paged: currentState.page,
						posts_per_page: currentState.perPage,
					});

					invalidate('getAppointments');
				}}
				fields={fields}
				actions={actions}
				data={appointments}
				paginationInfo={paginationInfo}
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
