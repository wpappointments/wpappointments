import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
// @ts-ignore
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { formatDate } from '~/backend/utils/i18n';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import { AppointmentDetailsModals } from '../AppointmentDetails/AppointmentDetails';
import { Info, Edit, Delete } from '~/backend/admin/components/Icons/Icons';
import Empty from '~/backend/admin/components/TableFull/Empty/Empty';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { appointmentsApi } from '~/backend/api/appointments';

type Fields = {
	status: Appointment['status'] | '';
	period: 'week' | 'month' | 'year' | 'all' | '';
	paged: number;
};

type View = {
	type: 'table';
	layout: object;
	hiddenFields: [];
	perPage: number;
	page: number;
};

export default function CustomersTable() {
	const { openSlideOut } = useSlideout({
		id: 'customer',
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
	});
	const { customers, totalItems, totalPages, currentPage } = useSelect(() => {
		return select(store).getAllCustomers();
	}, [filters, getSelector('getAllCustomers')]);

	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: 10,
		page: currentPage,
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

	if (!customers || customers.length === 0) {
		return (
			<Empty>
				<p>{__('You have no customers yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addAppointment}>
					{__('Create New Customer', 'wpappointments')}
				</Button>
			</Empty>
		);
	}

	const fields = [
		{
			id: 'name',
			header: __('Name', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return (
					<>
						<Button
							variant="link"
							onClick={() => {
								viewAppointment && viewAppointment(item);
							}}
							style={{ marginBottom: '5px' }}
						>
							<strong>{item.name}</strong>
						</Button>
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'email',
			header: __('Email', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return <a href={`mailto:${item.email}`}>{item.email}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'phone',
			header: __('Phone', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return <a href={`tel:${item.phone}`}>{item.phone}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'created',
			header: __('Created', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return <>{formatDate(item.created)}</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const actions = [
		{
			id: 'view',
			icon: () => <Info />,
			isPrimary: true,
			label: __('View appointment details', 'wpappointments'),
			callback: ([item]: [Appointment]) => {
				viewAppointment && viewAppointment(item);
			},
		},
		{
			id: 'edit',
			icon: () => <Edit />,
			isPrimary: true,
			label: __('Edit appointment details', 'wpappointments'),
			callback: ([item]: [Appointment]) => {
				editAppointment && editAppointment(item);
			},
		},
		{
			id: 'delete',
			icon: () => <Delete />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete appointment', 'wpappointments'),
			callback: ([item]: [Appointment]) => {
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
				onChangeView={(currentState: View) => {
					setView(currentState);
					setFilters({
						...filters,
						paged: currentState.page,
					});
					console.log(currentState);

					invalidate('getAppointments');
				}}
				fields={fields}
				actions={actions}
				data={customers}
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
