import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, funnel } from '@wordpress/icons';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { Slideout } from '~/backend/store/slideout/slideout.types';
import { store } from '~/backend/store/store';
import { Appointment } from '~/backend/types';
import styles from './Dashboard.module.css';
import AppointmentDetails from '~/backend/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/backend/admin/components/AppointmentForm/AppoitmentForm';
import Select from '~/backend/admin/components/FormField/Select/Select';
import SlideOut from '~/backend/admin/components/SlideOut/SlideOut';
import Table from '~/backend/admin/components/Table/Table';
import {
	StateContextProvider,
	useStateContext,
} from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import { appointmentsApi } from '~/backend/api/appointments';
import globalStyles from 'global.module.css';

type Fields = {
	status: Appointment['status'] | '';
	period: 'week' | 'month' | 'year' | 'all' | '';
};

export default function Dashboard() {
	const { openSlideOut, closeCurrentSlideOut } = useSlideout();
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [filters, setFilters] = useState<Fields>({
		status: 'confirmed',
		period: 'week',
	});
	const formRef = useRef<HTMLFormElement>(null);

	const { handleSubmit } = useForm<Fields>();

	const onSubmit = (data: Fields) => {
		setFilters(data);
	};

	return (
		<StateContextProvider>
			<LayoutDefault title="Dashboard">
				<DashboardStats />
				<Card className={globalStyles.card}>
					<CardHeader>
						<div className={styles.upcomingTitleWrapper}>
							<Text size="title">Upcoming Appointments</Text>
							{/* <Button
								variant={filtersOpen ? 'primary' : 'secondary'}
								size="small"
								onClick={() => {
									setFiltersOpen(!filtersOpen);
								}}
							>
								<Icon icon={funnel} size={16} />
							</Button>
							<Button
								variant="secondary"
								size="small"
								onClick={() => {
									console.log('manage all appointments');
								}}
							>
								Manage all appointments
							</Button> */}
						</div>
						<Button
							variant="primary"
							onClick={() => {
								openSlideOut({ id: 'add-appointment' });
							}}
						>
							Create New Appointment
						</Button>
					</CardHeader>
					{filtersOpen && (
						<CardHeader>
							<form
								ref={formRef}
								className={styles.filtersForm}
								onSubmit={handleSubmit(onSubmit)}
							>
								<Select
									name="status"
									label="Status"
									options={[
										{ label: 'Any', value: '' },
										{ label: 'Pending', value: 'pending' },
										{
											label: 'Confirmed',
											value: 'confirmed',
										},
										{
											label: 'Cancelled',
											value: 'cancelled',
										},
										{ label: 'No Show', value: 'no-show' },
									]}
									defaultValue="confirmed"
									onChange={() => {
										formRef.current?.dispatchEvent(
											new Event('submit', {
												bubbles: true,
											})
										);
									}}
								/>
								<Select
									name="period"
									label="Show appointments for next"
									options={[
										{ label: 'Week', value: 'week' },
										{ label: 'Month', value: 'month' },
										{ label: 'Year', value: 'year' },
										{ label: 'All', value: 'all' },
									]}
									defaultValue="week"
									onChange={() => {
										formRef.current?.dispatchEvent(
											new Event('submit', {
												bubbles: true,
											})
										);
									}}
								/>
							</form>
						</CardHeader>
					)}
					<CardBody style={{ backgroundColor: '#ececec' }}>
						<DashboardAppointments
							filters={filters}
							openSlideOut={openSlideOut}
						/>
					</CardBody>
				</Card>
				<SlideOut title={__('Appointment')} id="view-appointment">
					<AppointmentDetails />
				</SlideOut>
				<SlideOut
					title={__('Create New Appointment')}
					id="add-appointment"
				>
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
		return select(store).getUpcomingAppointments({
			...filters,
			posts_per_page: 30,
		});
	}, [filters, getSelector('getUpcomingAppointments')]);

	return (
		<Table
			items={appointments}
			onEmptyStateButtonClick={() => {
				openSlideOut({ id: 'add-appointment' });
			}}
			onEdit={(data) => {
				openSlideOut({
					id: 'edit-appointment',
					data: data.id,
				});
			}}
			onView={(data) => {
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
		<Card className={globalStyles.card}>
			<CardHeader>
				<Text size="title">Hello {settings.firstName}!</Text>
				<span>{new Date().toDateString()}</span>
			</CardHeader>
			<CardBody>
				{/* <img src={fakeStats} alt="fake stats" /> */}
			</CardBody>
		</Card>
	);
}
