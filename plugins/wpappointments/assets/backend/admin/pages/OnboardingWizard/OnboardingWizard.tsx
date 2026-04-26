import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Appointments from './Appointments/Appointments';
import Calendar from './Calendar/Calendar';
import General from './General/General';
import styles from './OnboardingWizard.module.css';
import Schedule from './Schedule/Schedule';
import ServicesStep from './Services/Services';
import gutenbergBlock from '~/images/gutenberg-block.png';
import logoIcon from '~/images/icons/logo-icon.svg';

export function OnboardingWizard() {
	const [currentStep, setCurrentStep] = useState(0);
	const totalSteps = 6;

	return (
		<div className={styles.wizard}>
			<div
				className={styles.progress}
				style={{
					width: `${(currentStep / totalSteps) * 100}%`,
				}}
			></div>
			<div className={styles.wizardHeader}>
				<img className={styles.logoIcon} src={logoIcon} />
				<Button
					variant="link"
					href="/wp-admin/admin-post.php?action=wpappointments_wizard_complete"
				>
					{__('Skip guided setup', 'appointments-booking')}
				</Button>
			</div>
			<div className={styles.wizardContent}>
				{currentStep === 0 && (
					<Welcome setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 1 && (
					<OnboardingWizardStep1 setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 2 && (
					<OnboardingWizardStep2 setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 3 && (
					<OnboardingWizardStep3 setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 4 && (
					<OnboardingWizardStep4 setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 5 && (
					<OnboardingWizardStep5 setCurrentStep={setCurrentStep} />
				)}
				{currentStep === 6 && <AllSet />}
			</div>
		</div>
	);
}

type SetStepAction = Dispatch<SetStateAction<number>>;
type StepProps = {
	setCurrentStep: SetStepAction;
};

function Welcome({ setCurrentStep }: StepProps) {
	return (
		<div className={styles.welcome}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Welcome to WP Appointments!', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__(
						"It's great to have you here! We'll be guiding you through the setup process - first, answer a few questions to tailor your experience.",
						'appointments-booking'
					)}
				</p>
			</div>
			<Button
				variant="primary"
				style={{
					justifyContent: 'center',
					fontSize: '130%',
					lineHeight: '2.5',
					padding: '5px 70px',
					height: 'auto',
				}}
				onClick={() => {
					setCurrentStep(1);
				}}
			>
				{__('Set up appointments', 'appointments-booking')}
			</Button>
		</div>
	);
}

function AllSet() {
	return (
		<div className={styles.welcome}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('All set!', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__(
						"You're good to go! You can now start accepting appointments on your website. You can always come back to the setup wizard to make changes.",
						'appointments-booking'
					)}
				</p>
				<hr style={{ width: 80 }} />
				<p className={styles.leadText}>
					{__(
						'When you are ready, you can insert a "Booking Flow" Gutenberg block on any of your pages.',
						'appointments-booking'
					)}
				</p>
				<img
					src={gutenbergBlock}
					className={styles.gutenbergBlockImage}
					alt={__(
						'Gutenberg block inserting visual guide',
						'appointments-booking'
					)}
				/>
			</div>
			<Button
				variant="primary"
				style={{
					justifyContent: 'center',
					fontSize: '130%',
					lineHeight: '2.5',
					padding: '5px 70px',
					height: 'auto',
				}}
				href="/wp-admin/admin-post.php?action=wpappointments_wizard_complete"
			>
				{__('Go to dashboard', 'appointments-booking')}
			</Button>
		</div>
	);
}

function OnboardingWizardStep1({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Tell us a bit about you', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'We use this information in set up notifications and you can also display this on the site.',
						'appointments-booking'
					)}
				</p>
			</div>
			<General
				onSuccess={() => {
					setCurrentStep((prev) => prev + 1);
				}}
			/>
		</div>
	);
}

function OnboardingWizardStep2({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__(
						'What appointments do you accept?',
						'appointments-booking'
					)}
				</h1>
				<p className={styles.leadText}>
					{__(
						'In the free version you can set up to one appointment. Specify the length and tell us in which intervals people can book.',
						'appointments-booking'
					)}
				</p>
			</div>
			<Appointments
				onSuccess={() => {
					setCurrentStep((prev) => prev + 1);
				}}
			/>
		</div>
	);
}

function OnboardingWizardStep3({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Tailor you calendar options', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__('You know what to do.', 'appointments-booking')}
				</p>
			</div>
			<Calendar
				onSuccess={() => {
					setCurrentStep((prev) => prev + 1);
				}}
			/>
		</div>
	);
}

function OnboardingWizardStep4({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Setup you working hours', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'You may specify one or many working hours periods for each week day.',
						'appointments-booking'
					)}
				</p>
			</div>
			<Schedule
				onSuccess={() => {
					setCurrentStep((prev) => prev + 1);
				}}
			/>
		</div>
	);
}

function OnboardingWizardStep5({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Set up your services', 'appointments-booking')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'Add the services you offer. You can add as many as you need and manage them later from the Services page.',
						'appointments-booking'
					)}
				</p>
			</div>
			<ServicesStep
				onSuccess={() => {
					setCurrentStep((prev) => prev + 1);
				}}
			/>
		</div>
	);
}
