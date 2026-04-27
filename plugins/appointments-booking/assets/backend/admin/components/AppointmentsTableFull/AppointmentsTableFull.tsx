import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { cancelCircleFilled, check, edit, info, trash } from '@wordpress/icons';
import { DataViews, TableFullEmpty } from '@wpappointments/components';
import type { Action, Field, View } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { addMinutes, fromUnixTime } from 'date-fns';
import cn from 'obj-str';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import styles from './AppointmentsTableFull.module.css';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { appointmentsApi } from '~/backend/api/appointments';

type Filters = {
	status: Appointment['status'] | '';
	period: 'week' | 'month' | 'year' | 'all' | '';
	paged: number;
	posts_per_page: number;
};

const defaultView: View = {
	type: 'table',
	search: '',
	filters: [],
	page: 1,
	perPage: 10,
	fields: ['title', 'date', 'time', 'status'],
	layout: {},
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
	const [filters, setFilters] = useState<Filters>({
		status: 'confirmed',
		period: 'week',
		paged: 1,
		posts_per_page: 10,
	});

	const { appointments, totalItems, totalPages } = useSelect(() => {
		return select(store).getAppointments({
			...filters,
			version: getSelector('getAppointments'),
		});
	}, [filters, getSelector('getAppointments')]);

	const [view, setView] = useState<View>(defaultView);

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
				<p>
					{__('You have no appointments yet', 'appointments-booking')}
				</p>
				<Button variant="primary" onClick={addAppointment}>
					{__('New Appointment', 'appointments-booking')}
				</Button>
			</TableFullEmpty>
		);
	}

	const fields: Field<Appointment>[] = [
		{
			id: 'title',
			label: __('Title', 'appointments-booking'),
			render: ({ item }) => {
				return (
					<>
						<Button
							variant="link"
							onClick={() => viewAppointment(item)}
						>
							<strong>{item.service}</strong>
						</Button>
						<br />
						{__('Customer', 'appointments-booking')}:{' '}
						<strong>{item.customer.name}</strong>
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'date',
			label: __('Date', 'appointments-booking'),
			render: ({ item }) => {
				return <>{formatDate(item.timestamp)}</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'time',
			label: __('Time', 'appointments-booking'),
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
			label: __('Status', 'appointments-booking'),
			render: ({ item }) => {
				return (
					<span
						className={cn({
							[styles.status]: true,
							[styles[item.status]]: true,
						})}
					>
						{item.status}
					</span>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const actions: Action<Appointment>[] = [
		{
			id: 'view',
			icon: info,
			label: __('View appointment details', 'appointments-booking'),
			callback: (items) => {
				viewAppointment(items[0]);
			},
		},
		{
			id: 'edit',
			icon: edit,
			label: __('Edit appointment details', 'appointments-booking'),
			callback: (items) => {
				editAppointment(items[0]);
			},
		},
		{
			id: 'cancel',
			icon: cancelCircleFilled,
			isEligible: (item) => item.status === 'confirmed',
			label: __('Cancel appointment', 'appointments-booking'),
			callback: (items) => {
				const { id, status } = items[0];
				setAppointmentModal({ id, status });
			},
		},
		{
			id: 'confirm',
			icon: check,
			isEligible: (item) => item.status === 'pending',
			label: __('Confirm appointment', 'appointments-booking'),
			callback: (items) => {
				confirmAppointment && confirmAppointment(items[0].id);
			},
		},
		{
			id: 'delete',
			icon: trash,
			isEligible: (item) => item.status === 'cancelled',
			label: __('Delete appointment', 'appointments-booking'),
			callback: (items) => {
				const { id, status } = items[0];
				setAppointmentModal({ id, status });
			},
		},
	];

	return (
		<>
			<DataViews
				data={appointments}
				fields={fields}
				view={view}
				onChangeView={(newView: View) => {
					setView(newView);
					setFilters({
						...filters,
						paged: newView.page ?? 1,
						posts_per_page: newView.perPage ?? 10,
					});
					invalidate('getAppointments');
				}}
				actions={actions}
				paginationInfo={{ totalItems, totalPages }}
				getItemId={(item: Appointment) => String(item.id)}
				search={false}
				defaultLayouts={{ table: {} }}
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
