import { ReactNode } from 'react';
import Table from '../components/Table/Table';
import LayoutDefault from '../layouts/LayoutDefault';
import {
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	CardHeader,
} from '@wordpress/components';
import { applyFilters } from '../../utils/hooks';

export default function Dashboard() {
	const UpcommingAppointmentsTable = applyFilters< ReactNode >(
		'upcoming-appointments-table',
		<Table />
	);

	return (
		<LayoutDefault title="Dashboard">
			<Card className="wpappointments-card">
				<CardHeader>
					<Text size="title">Hello Dawid!</Text>
					<span>{ new Date().toDateString() }</span>
				</CardHeader>
				<CardBody>
					<p>
						Today you have <strong>3</strong> appointments and{ ' ' }
						<strong>2</strong> pending appointments.
					</p>
				</CardBody>
			</Card>

			<Card className="wpappointments-card">
				<CardHeader>
					<Text size="title">Upcoming Appointments</Text>
					<Button variant="primary">Create New Appointment</Button>
				</CardHeader>
				<CardBody>{ UpcommingAppointmentsTable }</CardBody>
			</Card>
		</LayoutDefault>
	);
}
