import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import cn from '~/backend/utils/cn';
import styles from '../BookingFlow.module.css';
import BookingFlowCalendar from '../BookingFlowCalendar/BookingFlowCalendar';
import BookingFlowConfirmation from '../BookingFlowConfirmation/BookingFlowConfirmation';
import BookingFlowCustomer from '../BookingFlowCustomer/BookingFlowCustomer';
import SubmitButton from '../SubmitButton/SubmitButton';
import multiStepStyles from './BookingFlowMultiStep.module.css';
import {
	BookingFlowCalendarFields,
	BookingFlowCustomerFields,
	useBookingFlowContext,
} from '~/frontend/context/BookingFlowContext';

export default function BookingFlowMultiStep() {
	const { form, onSubmit, formError, formSuccess, attributes } =
		useBookingFlowContext();
	const { alignment } = attributes;
	const { handleSubmit, setValue, getValues, watch } = form;
	const [currentStep, setCurrentStep] = useState(0);

	const datetime = watch('datetime');

	const onSubmitDate = (data: BookingFlowCalendarFields) => {
		setValue('datetime', data.datetime);
		setCurrentStep(1);
	};

	const onSubmitCustomer = (data: BookingFlowCustomerFields) => {
		onSubmit({
			...data,
			datetime: getValues('datetime'),
		});
		setCurrentStep(2);
	};

	return (
		<>
			<header className={multiStepStyles.stepsHeader}>
				<div
					className={cn({
						[multiStepStyles.stepsHeaderLabel]: true,
						[multiStepStyles.stepsHeaderLabelActive]:
							currentStep === 0,
						[multiStepStyles.stepsHeaderLabelClickable]:
							currentStep !== 0 && !formSuccess,
						[multiStepStyles.stepsHeaderLabelCenter]:
							alignment === 'Center',
						[styles.alignLeft]: alignment === 'Left',
					})}
					onClick={() => {
						if (currentStep !== 0 && !formSuccess) {
							setCurrentStep(0);
						}
					}}
					data-step={1}
				>
					{__('Select date', 'wpappointments')}
				</div>
				<div
					className={cn({
						[multiStepStyles.stepsHeaderLabel]: true,
						[multiStepStyles.stepsHeaderLabelActive]:
							currentStep === 1,
						[multiStepStyles.stepsHeaderLabelClickable]:
							currentStep !== 1 && !formSuccess && datetime,
					})}
					onClick={() => {
						if (currentStep !== 1 && !formSuccess && datetime) {
							setCurrentStep(1);
						}
					}}
					data-step={2}
				>
					{__('About you', 'wpappointments')}
				</div>
				<div
					className={cn({
						[multiStepStyles.stepsHeaderLabel]: true,
						[multiStepStyles.stepsHeaderLabelActive]:
							currentStep === 2 && formSuccess,
					})}
					data-step={3}
				>
					{__('Summary', 'wpappointments')}
				</div>
			</header>
			{currentStep === 0 && (
				<form onSubmit={handleSubmit(onSubmitDate)}>
					{formError && <p className={styles.error}>{formError}</p>}
					<h2>{__('Select date and time', 'wpappointments')}</h2>
					<BookingFlowCalendar />
					<SubmitButton label={__('Next step', 'wpappointments')} />
				</form>
			)}
			{currentStep === 1 && (
				<form onSubmit={handleSubmit(onSubmitCustomer)}>
					{formError && <p className={styles.error}>{formError}</p>}
					<h2>{__('Customer information', 'wpappointments')}</h2>
					<BookingFlowCustomer />
					<SubmitButton />
				</form>
			)}
			{currentStep === 2 && formSuccess && <BookingFlowConfirmation />}
		</>
	);
}
