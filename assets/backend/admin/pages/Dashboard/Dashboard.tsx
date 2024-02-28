import { useState } from 'react';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { Slideout } from '~/backend/store/slideout/slideout.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import styles from './Dashboard.module.css';
import AppointmentDetails from '~/backend/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/backend/admin/components/AppointmentForm/AppointmentForm';
import Table from '~/backend/admin/components/Table/Table';
import { StateContextProvider, useStateContext } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import { appointmentsApi } from '~/backend/api/appointments';
import globalStyles from 'global.module.css';


type Fields = {
	status: Appointment['status'] | '';
	period: 'week' | 'month' | 'year' | 'all' | '';
};

export default function Dashboard() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();
	const [filters, _] = useState<Fields>({
		status: 'confirmed',
		period: 'week',
	});

	return (
		<StateContextProvider>
			<LayoutDefault title="Dashboard">
				<DashboardStats />
				<Card className={globalStyles.card}>
					<CardHeader>
						<div className={styles.upcomingTitleWrapper}>
							<Text size="title">
								{__('All Appointments', 'wpappointments')}
							</Text>
						</div>
						<Button
							variant="primary"
							onClick={() => {
								openSlideOut({
									id: 'appointment',
									data: {
										mode: 'create',
									},
								});
							}}
						>
							{__('Create New Appointment', 'wpappointments')}
						</Button>
					</CardHeader>
					<CardBody style={{ backgroundColor: '#ececec' }}>
						<DashboardAppointments
							filters={filters}
							openSlideOut={openSlideOut}
						/>
					</CardBody>
				</Card>

				{isSlideoutOpen('view-appointment') && <AppointmentDetails />}
				{isSlideoutOpen('appointment') && <AppointmentForm />}
			</LayoutDefault>
		</StateContextProvider>
	);
}

function DashboardAppointments({
	openSlideOut,
	filters,
}: {
	openSlideOut: (slideout: Slideout) => void;
	filters: Fields;
}) {
	const { invalidate, getSelector } = useStateContext();
	const { deleteAppointment, cancelAppointment } = appointmentsApi({
		invalidateCache: invalidate,
	});

	const appointments = useSelect(() => {
		return select(store).getAppointments({
			...filters,
			posts_per_page: -1,
		});
	}, [filters, getSelector('getAppointments')]);

	return (
		<Table
			items={appointments}
			onEmptyStateButtonClick={() => {
				openSlideOut({
					id: 'appointment',
					data: {
						mode: 'create',
					},
				});
			}}
			onEdit={(data) => {
				openSlideOut({
					id: 'appointment',
					data: {
						selectedAppointment: data.id,
						mode: 'edit',
					},
				});
			}}
			onView={(data) => {
				openSlideOut({
					id: 'view-appointment',
					data: {
						selectedAppointment: data.id,
					},
				});
			}}
			onCancel={cancelAppointment}
			deleteAppointment={deleteAppointment}
			cancelAppointment={cancelAppointment}
		/>
	);
}

function DashboardStats() {
	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">Hello {settings.firstName}!</Text>
				<span>{new Date().toDateString()}</span>
			</CardHeader>
		</Card>
	);
}