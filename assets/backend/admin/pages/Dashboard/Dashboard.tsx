import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, funnel } from '@wordpress/icons';
import { Text } from '~/utils/experimental';
import useSlideout from '~/hooks/useSlideout';
import { Slideout } from '~/store/slideout/slideout.types';
import { store } from '~/store/store';
import { Appointment } from '~/types';
import { filtersForm, upcomingTitleWrapper } from './Dashboard.module.css';
import AppointmentDetails from '~/admin/components/AppointmentDetails/AppointmentDetails';
import AppointmentForm from '~/admin/components/AppointmentForm/AppoitmentForm';
import Select from '~/admin/components/FormField/Select/Select';
import SlideOut from '~/admin/components/SlideOut/SlideOut';
import Table from '~/admin/components/Table/Table';
import TimeFinder from '~/admin/components/TimeFinder/TimeFinder';
import {
	StateContextProvider,
	useStateContext,
} from '~/admin/context/StateContext';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import { appointmentsApi } from '~/api/appointments';
import { card } from 'global.module.css';

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
				<Card className={card}>
					<CardHeader>
						<div className={upcomingTitleWrapper}>
							<Text size="title">Upcoming Appointments</Text>
							<Button
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
							</Button>
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
								className={filtersForm}
								onSubmit={handleSubmit(onSubmit)}
							>
								<Select
									name="status"
									label="Status"
									options={[
										{ label: 'Any', value: '' },
										{ label: 'Active', value: 'active' },
										{
											label: 'Completed',
											value: 'completed',
										},
										{
											label: 'Cancelled',
											value: 'cancelled',
										},
										{ label: 'No Show', value: 'no-show' },
									]}
									defaultValue="active"
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
				<SlideOut
					title={__('Appointment')}
					id="view-appointment"
					headerRightSlot={<Button>Hello</Button>}
				>
					<AppointmentDetails />
				</SlideOut>
				<SlideOut
					title={__('Create New Appointment')}
					id="add-appointment"
					sidePanel
				>
					<AppointmentForm
						mode="create"
						onSubmitComplete={closeCurrentSlideOut}
					/>
				</SlideOut>
				<SlideOut
					title={__('Edit Appointment')}
					id="edit-appointment"
					sidePanel
				>
					<AppointmentForm
						mode="edit"
						onSubmitComplete={closeCurrentSlideOut}
					/>
				</SlideOut>
				<SlideOut
					title={__('Find time')}
					id="find-time"
					headerRightSlot={<Button>Hello</Button>}
					style={{
						right: '700px',
					}}
				>
					<TimeFinder />
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
