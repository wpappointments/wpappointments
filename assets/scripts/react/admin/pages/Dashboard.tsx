import { ReactNode } from 'react';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import Table from '../components/Table/Table';
import LayoutDefault from '../layouts/LayoutDefault';
import { applyFilters } from '../../utils/hooks';
import { Text } from '../../utils/experimental';
import apiFetch, { APIResponse } from '../../utils/fetch';
import { store } from '../../../redux/store';

type Action = {
	name: string;
	label: string;
	method: string;
	uri: string;
	isDangerous: boolean;
};

type Appointment = {
	id: number;
	title: string;
	date: string;
	time: string;
	actions: {
		[ key: string ]: Action;
	};
};

export default function Dashboard() {
	const dispatch = useDispatch( store );
	const appointments = useSelect( () => {
		const appStore = select( store );
		return appStore.getUpcomingAppointments();
	}, [] );

	const UpcommingAppointmentsTable = applyFilters< ReactNode >(
		'upcoming-appointments-table',
		<Table items={ appointments } dispatch={ dispatch } />
	);

	const onAddAppointmentClick = async () => {
		const response = await apiFetch<
			APIResponse< { appointment: Appointment; message: string } >
		>( {
			path: 'appointment',
			method: 'POST',
			data: {
				date: '2021-08-20',
				time: '10:00',
			},
		} );

		const { data } = response;
		const { appointment } = data;

		dispatch.addAppointment( appointment );
	};

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
					<Button variant="primary" onClick={ onAddAppointmentClick }>
						Create New Appointment
					</Button>
				</CardHeader>
				<CardBody>{ UpcommingAppointmentsTable }</CardBody>
			</Card>
		</LayoutDefault>
	);
}
