import { Button, Card, CardBody, CardHeader } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useForm } from 'react-hook-form';
import Table from '~/admin/components/Table/Table';
import LayoutDefault from '~/admin/layouts/LayoutDefault/LayoutDefault';
import SlideOut from '~/admin/components/SlideOut/SlideOut';
import Input from '~/admin/components/FormField/Input/Input';
import DateTimePicker from '~/admin/components/FormField/DateTimePicker/DateTimePicker';
import { Text } from '~/utils/experimental';
import { APIResponse } from '~/utils/fetch';
import { store } from '~/store/store';
import { card } from 'global.module.css';
import { useAppointments } from '~/hooks/api/appointments';
import { Appointment } from '~/types';

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
				<NewAppointmentForm onSubmitComplete={closeSlideOut} />
			</SlideOut>
		</LayoutDefault>
	);
}

type Fields = {
	title: string;
	datetime: string;
};

type FormProps = {
	onSubmitComplete?: (
		data: APIResponse<{
			appointment: Appointment;
			message: string;
		}>
	) => void;
};

function NewAppointmentForm({ onSubmitComplete }: FormProps) {
	const { createAppointment } = useAppointments();
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<Fields>();

	const onSubmit = async (formData: Fields) => {
		console.log('formData', formData);
		const data = await createAppointment(formData);

		if (onSubmitComplete) {
			onSubmitComplete(data);
		}

		reset();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Input
				control={control}
				errors={errors}
				name="title"
				label="Title"
				placeholder="Eg. Meeting with John Doe"
				rules={{
					required: true,
				}}
			/>

			<div style={{ maxWidth: '300px' }}>
				<DateTimePicker
					control={control}
					errors={errors}
					name="datetime"
					label="Date and Time"
				/>
			</div>

			<Button type="submit" variant="primary">
				Create Appointment
			</Button>
		</form>
	);
}
