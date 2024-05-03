import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Appointments from './Appointments/Appointments';
import Calendar from './Calendar/Calendar';
import General from './General/General';
import styles from './OnboardingWizard.module.css';
import Schedule from './Schedule/Schedule';
import gutenbergBlock from '~/images/gutenberg-block.png';
import logoIcon from '~/images/icons/logo-icon.svg';

export function OnboardingWizard() {
	const [currentStep, setCurrentStep] = useState(0);
	const totalSteps = 5;

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
					Skip guided setup
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
				{currentStep === 5 && <AllSet />}
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
				<h1 className={styles.title}>Welcome to WP Appointments!</h1>
				<p className={styles.leadText}>
					It's great to have you here! We'll be guiding you through
					the setup process - first, answer a few questions to tailor
					your experience.
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
					console.log('clicked');
					setCurrentStep(1);
				}}
			>
				{__('Set up appointments', 'wpappointments')}
			</Button>
		</div>
	);
}

function AllSet() {
	return (
		<div className={styles.welcome}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>All set!</h1>
				<p className={styles.leadText}>
					{__(
						"You're good to go! You can now start accepting appointments on your website. You can always come back to the setup wizard to make changes.",
						'wpappointments'
					)}
				</p>
				<hr style={{ width: 80 }} />
				<p className={styles.leadText}>
					{__(
						'For more information about the plugin please see this walkthrough video:',
						'wpappointments'
					)}{' '}
					<a href="https://wpappointments.com/" target="_blank">
						{__('Watch video', 'wpappointments')}
					</a>
				</p>
				<hr style={{ width: 80 }} />
				<p className={styles.leadText}>
					{__(
						'When you are ready, you can insert a "Booking Flow" Gutenberg block on any of your pages.',
						'wpappointments'
					)}
				</p>
				<img
					src={gutenbergBlock}
					className={styles.gutenbergBlockImage}
					alt="Gutenberg block inserting visual guide"
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
				{__('Go to dashboard', 'wpappointments')}
			</Button>
		</div>
	);
}

function OnboardingWizardStep1({ setCurrentStep }: StepProps) {
	return (
		<div style={{ margin: '40px auto' }}>
			<div className={styles.stepHeader}>
				<h1 className={styles.title}>
					{__('Tell us a bit about you', 'wpappointments')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'We use this information in set up notifications and you can also display this on the site.',
						'wpappointments'
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
					{__('What appointments do you accept?', 'wpappointments')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'In the free version you can set up to one appointment. Specify the length and tell us in which intervals people can book.',
						'wpappointments'
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
					{__('Tailor you calendar options', 'wpappointments')}
				</h1>
				<p className={styles.leadText}>
					{__('You know what to do.', 'wpappointments')}
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
					{__('Setup you working hours', 'wpappointments')}
				</h1>
				<p className={styles.leadText}>
					{__(
						'You may specify one or many working hours periods for each week day.',
						'wpappointments'
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
