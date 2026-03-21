import { Button, Card, CardHeader } from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { CardBody } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { Slideout } from '~/backend/store/slideout/slideout.types';
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
	// @todo refactor - move to each component
	const { openSlideOut, isSlideoutOpen } = useSlideout();

	return (
		<StateContextProvider>
			<LayoutDefault title={__('Dashboard', 'wpappointments')}>
				<div className={styles.header}>
					<DashboardStats />
					<UpcomingAppointments openSlideOut={openSlideOut} />
				</div>
				<div>
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
						<CardBody>
							<DashboardAppointments />
						</CardBody>
					</Card>
				</div>

				{isSlideoutOpen('view-appointment') && <AppointmentDetails />}
				{isSlideoutOpen('appointment') && <AppointmentForm />}
			</LayoutDefault>
		</StateContextProvider>
	);
}

function DashboardAppointments() {
	return <AppointmentsTableFull />;
}

function UpcomingAppointments({
	openSlideOut,
}: {
	openSlideOut: (slideout: Slideout) => void;
}) {
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
				<Text size="title">
					{__('Upcoming Appointments', 'wpappointments')}
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
						'wpappointments'
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
				<Text size="title">
					{/* translators: 1 admin area user name */}
					{sprintf(
						__('Hello %s!', 'wpappointments'),
						settings.firstName
					)}
				</Text>
				<span>{new Date().toDateString()}</span>
			</CardHeader>
			<CardBody style={{ padding: 0 }}>
				<img
					src={statsPlaceholder}
					className={styles.statsPlaceholderImage}
					alt={__('Dashboard stats placeholder', 'wpappointments')}
				/>
			</CardBody>
		</Card>
	);
}
