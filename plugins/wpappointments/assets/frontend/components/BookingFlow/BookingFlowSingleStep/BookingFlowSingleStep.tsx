import { __ } from '@wordpress/i18n';
import styles from '../BookingFlow.module.css';
import BookingFlowCalendar from '../BookingFlowCalendar/BookingFlowCalendar';
import BookingFlowConfirmation from '../BookingFlowConfirmation/BookingFlowConfirmation';
import BookingFlowCustomer from '../BookingFlowCustomer/BookingFlowCustomer';
import SubmitButton from '../SubmitButton/SubmitButton';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';
import { Slot } from '~/frontend/slotfill';

export default function BookingFlowSingleStep() {
	const { onSubmit, formError, formSuccess, attributes } =
		useBookingFlowContext();
	const { hideStepTitles } = attributes;

	if (formSuccess) {
		return <BookingFlowConfirmation />;
	}

	return (
		<form
			className={styles.form}
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
		>
			{formError && <p className={styles.error}>{formError}</p>}
			{!hideStepTitles && (
				<h2>{__('Select date and time', 'appointments-booking')}</h2>
			)}
			<BookingFlowCalendar />
			{!hideStepTitles && (
				<h2>{__('Customer information', 'appointments-booking')}</h2>
			)}
			<BookingFlowCustomer />
			<Slot name="booking-flow/actions">
				<SubmitButton />
			</Slot>
		</form>
	);
}
