import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Text } from '~/utils/experimental';
import useSlideout from '~/hooks/useSlideout';
import { Slideout } from '~/store/slideout/slideout.types';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import AppointmentDetails from '~/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/admin/components/AppointmentForm/AppoitmentForm';
import SlideOut from '~/admin/components/SlideOut/SlideOut';
import Table from '~/admin/components/Table/Table';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import { appointmentsApi } from '~/api/appointments';
import { card } from 'global.module.css';

export default function Dashboard() {
	const { openSlideOut, closeCurrentSlideOut } = useSlideout();

	return (
		<LayoutDefault title="Dashboard">
			<DashboardStats />
			<Card className={card}>
				<CardHeader>
					<Text size="title">Upcoming Appointments</Text>
					<Button
						variant="primary"
						onClick={() => {
							openSlideOut({ id: 'add-appointment' });
						}}
					>
						Create New Appointment
					</Button>
				</CardHeader>
				<CardBody style={{ backgroundColor: '#ececec' }}>
					<DashboardAppointments openSlideOut={openSlideOut} />
				</CardBody>
			</Card>
			<SlideOut title={__('Appointment')} id="view-appointment">
				<AppointmentDetails />
			</SlideOut>
			<SlideOut title={__('Create New Appointment')} id="add-appointment">
				<AppointmentForm
					mode="create"
					onSubmitComplete={closeCurrentSlideOut}
				/>
			</SlideOut>
			<SlideOut title={__('Edit Appointment')} id="edit-appointment">
				<AppointmentForm
					mode="edit"
					onSubmitComplete={closeCurrentSlideOut}
				/>
			</SlideOut>
		</LayoutDefault>
	);
}

function DashboardAppointments({
	openSlideOut,
}: {
	openSlideOut: (slideout: Slideout) => void;
}) {
	const { deleteAppointment, cancelAppointment } = appointmentsApi();

	const appointments = useSelect(() => {
		return select(store).getUpcomingAppointments({
			posts_per_page: 1,
		});
	}, []);

	return (
		<Table
			items={appointments}
			onEmptyStateButtonClick={() => {
				openSlideOut({ id: 'add-appointment' });
			}}
			onEdit={(data: Appointment) => {
				openSlideOut({
					id: 'edit-appointment',
					data: data.id,
				});
			}}
			onView={(data: Appointment) => {
				openSlideOut({
					id: 'view-appointment',
					data: data.id,
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
		<Card className={card}>
			<CardHeader>
				<Text size="title">Hello {settings.firstName}!</Text>
				<span>{new Date().toDateString()}</span>
			</CardHeader>
			<CardBody>
				<p>
					Today you have <strong>3</strong> appointments and{' '}
					<strong>2</strong> pending appointments.
				</p>
			</CardBody>
		</Card>
	);
}
