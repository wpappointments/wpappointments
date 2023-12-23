import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import Table from '~/admin/components/Table/Table';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import SlideOut, { SlideOutBody } from '~/admin/components/SlideOut/SlideOut';
import AppointmentForm from '~/admin/components/AppointmentForm/AppoitmentForm';
import { Text } from '~/utils/experimental';
import { getAppointmentSlideOutTitle } from '~/utils/slideout';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import { card } from 'global.module.css';

export default function Dashboard() {
	const dispatch = useDispatch(store);

	const appointments = useSelect(() => {
		return select(store).getUpcomingAppointments();
	}, []);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	return (
		<SlideOut>
			{({
				slideOutIsOpen,
				selectedAppointment,
				setSelectedAppointment,
				openSlideOut,
				closeSlideOut,
				mode,
				setMode,
			}) => (
				<LayoutDefault title="Dashboard">
					<Card className={card}>
						<CardHeader>
							<Text size="title">
								Hello {settings.firstName}!
							</Text>
							<span>{new Date().toDateString()}</span>
						</CardHeader>
						<CardBody>
							<p>
								Today you have <strong>3</strong> appointments
								and <strong>2</strong> pending appointments.
							</p>
						</CardBody>
					</Card>
					<Card className={card}>
						<CardHeader>
							<Text size="title">Upcoming Appointments</Text>
							<Button
								variant="primary"
								onClick={() => {
									openSlideOut();
									setMode('create');
								}}
							>
								Create New Appointment
							</Button>
						</CardHeader>
						<CardBody style={{ backgroundColor: '#ececec' }}>
							<Table
								items={appointments}
								dispatch={dispatch}
								onEmptyStateButtonClick={() => {
									openSlideOut();
									setMode('create');
								}}
								onEdit={(data: Appointment) => {
									setSelectedAppointment(data);
									setMode('edit');
									openSlideOut();
								}}
								onView={(data: Appointment) => {
									setSelectedAppointment(data);
									setMode('view');
									openSlideOut();
								}}
							/>
						</CardBody>
					</Card>
					<SlideOutBody
						title={getAppointmentSlideOutTitle(mode)}
						isOpen={slideOutIsOpen}
						onOverlayClick={closeSlideOut}
					>
						<AppointmentForm
							onSubmitComplete={closeSlideOut}
							selectedAppointment={selectedAppointment}
							mode={mode}
							setMode={setMode}
							closeSlideOut={closeSlideOut}
						/>
					</SlideOutBody>
				</LayoutDefault>
			)}
		</SlideOut>
	);
}
