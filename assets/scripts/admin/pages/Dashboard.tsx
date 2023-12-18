import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import Table from '~/admin/components/Table/Table';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import { Text } from '~/utils/experimental';
import apiFetch, { APIResponse } from '~/utils/fetch';
import { store } from '~/store/store';
import { card } from 'global.module.css';

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
		[key: string]: Action;
	};
};

export default function Dashboard() {
	const dispatch = useDispatch(store);
	const appointments = useSelect(() => {
		return select(store).getUpcomingAppointments();
	}, []);
	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	const onAddAppointmentClick = async () => {
		const response = await apiFetch<
			APIResponse<{ appointment: Appointment; message: string }>
		>({
			path: 'appointment',
			method: 'POST',
			data: {
				date: '2021-08-20',
				time: '10:00',
			},
		});

		const { data } = response;
		const { appointment } = data;

		dispatch.addAppointment(appointment);
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
					<Button variant="primary" onClick={onAddAppointmentClick}>
						Create New Appointment
					</Button>
				</CardHeader>
				<CardBody style={{ backgroundColor: '#ececec' }}>
					<Table items={appointments} dispatch={dispatch} />
				</CardBody>
			</Card>
		</LayoutDefault>
	);
}
