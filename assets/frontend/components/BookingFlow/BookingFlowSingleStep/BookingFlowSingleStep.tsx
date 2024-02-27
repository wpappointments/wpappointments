import { __ } from '@wordpress/i18n';
import styles from '../BookingFlow.module.css';
import BookingFlowCalendar from '../BookingFlowCalendar/BookingFlowCalendar';
import BookingFlowConfirmation from '../BookingFlowConfirmation/BookingFlowConfirmation';
import BookingFlowCustomer from '../BookingFlowCustomer/BookingFlowCustomer';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowSingleStep() {
	const { form, onSubmit, formError, formSuccess } = useBookingFlowContext();
	const { handleSubmit } = form;

	if (formSuccess) {
		return <BookingFlowConfirmation />;
	}

	return (
		<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
			{formError && <p className={styles.error}>{formError}</p>}
			<h2>{__('Select date and time', 'wpappointments')}</h2>
			<BookingFlowCalendar />
			<h2>{__('Customer information', 'wpappointments')}</h2>
			<BookingFlowCustomer />
			<SubmitButton />
		</form>
	);
}
