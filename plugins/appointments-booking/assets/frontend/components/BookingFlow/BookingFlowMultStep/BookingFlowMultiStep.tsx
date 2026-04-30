import { useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import cn from 'obj-str';
import BackButton from '../BackButton/BackButton';
import styles from '../BookingFlow.module.css';
import BookingFlowCalendar from '../BookingFlowCalendar/BookingFlowCalendar';
import BookingFlowConfirmation from '../BookingFlowConfirmation/BookingFlowConfirmation';
import BookingFlowCustomer from '../BookingFlowCustomer/BookingFlowCustomer';
import SubmitButton from '../SubmitButton/SubmitButton';
import multiStepStyles from './BookingFlowMultiStep.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';
import { Slot } from '~/frontend/slotfill';

export default function BookingFlowMultiStep() {
	const {
		formData,
		onSubmit,
		formError,
		formSuccess,
		attributes,
		setGoBack,
		editorStep,
		isEditor,
	} = useBookingFlowContext();
	const { alignment, hideProgressBar, hideStepTitles } = attributes;
	const [currentStep, setCurrentStep] = useState(0);
	const stepHeadingRef = useRef<HTMLHeadingElement>(null);
	const previousStepRef = useRef(0);

	const activeStep = isEditor ? (editorStep ?? 0) : currentStep;

	useEffect(() => {
		setGoBack(() => setCurrentStep(0));
	}, [setGoBack]);

	useEffect(() => {
		if (formSuccess) {
			setCurrentStep(2);
		}
	}, [formSuccess]);

	// Focus the step heading when the step changes so screen readers
	// announce the new step and keyboard users land at the start of the
	// new content. Skip the first render and skip the editor preview
	// (where the user is editing block attributes, not navigating).
	useEffect(() => {
		if (isEditor) return;
		if (previousStepRef.current === activeStep) return;
		previousStepRef.current = activeStep;
		stepHeadingRef.current?.focus();
	}, [activeStep, isEditor]);

	const datetime = formData.datetime;

	const onSubmitCustomer = async () => {
		await onSubmit();
	};

	return (
		<>
			{!hideProgressBar && (
				<header className={multiStepStyles.stepsHeader}>
					<button
						type="button"
						className={cn({
							[multiStepStyles.stepsHeaderLabel]: true,
							[multiStepStyles.stepsHeaderLabelActive]:
								activeStep === 0,
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
						{__('Select date', 'appointments-booking')}
					</button>
					<button
						type="button"
						className={cn({
							[multiStepStyles.stepsHeaderLabel]: true,
							[multiStepStyles.stepsHeaderLabelActive]:
								activeStep === 1,
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
						{__('About you', 'appointments-booking')}
					</button>
					<div
						className={cn({
							[multiStepStyles.stepsHeaderLabel]: true,
							[multiStepStyles.stepsHeaderLabelActive]:
								activeStep === 2 && formSuccess,
						})}
						data-step={3}
					>
						{__('Summary', 'appointments-booking')}
					</div>
				</header>
			)}

			{activeStep === 0 && (
				<div>
					{formError && <p className={styles.error}>{formError}</p>}
					{!hideStepTitles && (
						<h2 ref={stepHeadingRef} tabIndex={-1}>
							{__('Select date and time', 'appointments-booking')}
						</h2>
					)}
					<BookingFlowCalendar
						onSlotSelected={
							isEditor ? undefined : () => setCurrentStep(1)
						}
					/>
				</div>
			)}
			{activeStep === 1 && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmitCustomer();
					}}
				>
					{formError && <p className={styles.error}>{formError}</p>}
					{!hideStepTitles && (
						<h2 ref={stepHeadingRef} tabIndex={-1}>
							{__('Customer information', 'appointments-booking')}
						</h2>
					)}
					<BookingFlowCustomer />
					<Slot name="booking-flow/actions">
						<div className={multiStepStyles.stepActions}>
							<BackButton onClick={() => setCurrentStep(0)} />
							<SubmitButton />
						</div>
					</Slot>
				</form>
			)}
			{activeStep === 2 && formSuccess && <BookingFlowConfirmation />}
		</>
	);
}
