import { ReactNode, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import Table from '../components/Table/Table';
import LayoutDefault from '../layouts/LayoutDefault';
import { applyFilters } from '../../utils/hooks';
import { Text } from '../../utils/experimental';

export default function Dashboard() {
	const [ appointments, setAppointments ] = useState< any[] >( [] );

	useEffect( () => {
		const getAppointments = async () => {
			const response = await fetch(
				`${ window.wpappointments.api.url }/appointment`,
				{
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': window.wpappointments.api.nonce,
					},
				}
			);

			const { data } = await response.json();
			const { appointments: results } = data;

			setAppointments( results );
		};

		getAppointments();
	}, [] );

	const UpcommingAppointmentsTable = applyFilters< ReactNode >(
		'upcoming-appointments-table',
		<Table items={ appointments } />
	);

	const onAddAppointmentClick = async () => {
		const response = await fetch(
			`${ window.wpappointments.api.url }/appointment`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpappointments.api.nonce,
				},
				body: JSON.stringify( {
					date: '2021-08-20',
					time: '10:00',
				} ),
			}
		);

		const { data } = await response.json();
		const { appointment } = data;

		setAppointments( [ ...appointments, appointment ] );

		console.log( data );

		// return data;
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
