import { Button, Card, CardHeader } from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { CardBody } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { store } from '~/backend/store/store';
import AppointmentsTableMinimal from '../../components/AppointmentsTableMinimal/AppointmentsTableMinimal';
import styles from './Dashboard.module.css';
import AppointmentDetails from '~/backend/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/backend/admin/components/AppointmentForm/AppointmentForm';
import AppointmentsTableFull from '~/backend/admin/components/AppointmentsTableFull/AppointmentsTableFull';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import statsPlaceholder from '~/images/stats-placeholder.png';
import globalStyles from 'global.module.css';

export default function Dashboard() {
	const { isSlideoutOpen } = useSlideout();

	return (
		<StateContextProvider>
			<LayoutDefault title={__('Dashboard', 'appointments-booking')}>
				<div className={styles.header}>
					<DashboardStats />
					<UpcomingAppointments />
				</div>
				<div>
					<DashboardAppointments />
				</div>

				{isSlideoutOpen('view-appointment') && <AppointmentDetails />}
				{isSlideoutOpen('appointment') && <AppointmentForm />}
			</LayoutDefault>
		</StateContextProvider>
	);
}

function DashboardAppointments() {
	const { openSlideOut } = useSlideout();

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<div className={styles.upcomingTitleWrapper}>
					<Text size="subheadline">
						{__('All Appointments', 'appointments-booking')}
					</Text>
				</div>
				<Button
					variant="primary"
					size="compact"
					onClick={() => {
						openSlideOut({
							id: 'appointment',
							data: {
								mode: 'create',
							},
						});
					}}
				>
					{__('New Appointment', 'appointments-booking')}
				</Button>
			</CardHeader>
			<CardBody>
				<AppointmentsTableFull />
			</CardBody>
		</Card>
	);
}

function UpcomingAppointments() {
	const { openSlideOut } = useSlideout();

	const appointments = useSelect(() => {
		return select(store).getUpcomingAppointments({
			posts_per_page: 10,
			status: ['confirmed', 'pending'],
			period: 'day',
		});
	}, []);

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="subheadline">
					{__('Upcoming Appointments', 'appointments-booking')}
				</Text>
			</CardHeader>
			<CardBody>
				<AppointmentsTableMinimal
					items={appointments}
					onView={(data) => {
						openSlideOut({
							id: 'view-appointment',
							data: {
								selectedAppointment: data.id,
							},
						});
					}}
					emptyStateMessage={__(
						'No appointments in the next 24 hours',
						'appointments-booking'
					)}
				/>
			</CardBody>
		</Card>
	);
}

function DashboardStats() {
	const settings = useSelect(() => {
		return select(store).getGeneralSettings();
	}, []);

	return (
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="subheadline">
					{/* translators: 1 admin area user name */}
					{sprintf(
						__('Hello %s!', 'appointments-booking'),
						settings.firstName
					)}
				</Text>
				<Text size="subheadline">{new Date().toDateString()}</Text>
			</CardHeader>
			<CardBody style={{ padding: 0 }}>
				<img
					src={statsPlaceholder}
					className={styles.statsPlaceholderImage}
					alt={__(
						'Dashboard stats placeholder',
						'appointments-booking'
					)}
				/>
			</CardBody>
		</Card>
	);
}
