import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import Table from '~/admin/components/Table/Table';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import SlideOut from '~/admin/components/SlideOut/SlideOut';
import AppointmentForm from '~/admin/components/AppointmentForm/AppoitmentForm';
import { Text } from '~/utils/experimental';
import { store } from '~/store/store';
import { card } from 'global.module.css';

export default function Dashboard() {
	const dispatch = useDispatch(store);

	const appointments = useSelect(() => {
		return select(store).getUpcomingAppointments();
	}, []);

	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const [slideOutIsOpen, setSlideOutIsOpen] = useState(false);

	const openSlideOut = () => {
		setSlideOutIsOpen(true);
	};

	const closeSlideOut = () => {
		setSlideOutIsOpen(false);
	};

	return (
		<LayoutDefault title="Dashboard">
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

			<Card className={card}>
				<CardHeader>
					<Text size="title">Upcoming Appointments</Text>
					<Button variant="primary" onClick={openSlideOut}>
						Create New Appointment
					</Button>
				</CardHeader>
				<CardBody style={{ backgroundColor: '#ececec' }}>
					<Table
						items={appointments}
						dispatch={dispatch}
						onEmptyStateButtonClick={openSlideOut}
					/>
				</CardBody>
			</Card>
			<SlideOut
				isOpen={slideOutIsOpen}
				onOverlayClick={closeSlideOut}
				title="Create new appointment"
			>
				<AppointmentForm onSubmitComplete={closeSlideOut} />
			</SlideOut>
		</LayoutDefault>
	);
}
