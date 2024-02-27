import { __ } from '@wordpress/i18n';
import bookingFlowStyles from '../BookingFlow.module.css';
import styles from './BookingFlowCustomer.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowCustomer() {
	const { form } = useBookingFlowContext();
	const {
		register,
		formState: { errors },
		watch,
	} = form;
	const account = watch('account');

	return (
		<div>
			<div className={bookingFlowStyles.field}>
				<input
					type="text"
					placeholder={__('First name', 'wpappointments')}
					className={styles.input}
					{...register('firstName', {
						required: true,
					})}
				/>
				{errors.firstName && (
					<p className={bookingFlowStyles.error}>
						{__('First name is required', 'wpappointments')}
					</p>
				)}
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="text"
					placeholder={__('Last name', 'wpappointments')}
					className={styles.input}
					{...register('lastName', {
						required: true,
					})}
				/>
				{errors.lastName && (
					<p className={bookingFlowStyles.error}>
						{__('Last name is required', 'wpappointments')}
					</p>
				)}
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="email"
					placeholder={__('Email', 'wpappointments')}
					className={styles.input}
					{...register('email', {
						required: true,
					})}
				/>
				{errors.email && (
					<p className={bookingFlowStyles.error}>
						{__('Email is required', 'wpappointments')}
					</p>
				)}
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="tel"
					placeholder={__('Phone', 'wpappointments')}
					className={styles.input}
					{...register('phone', {
						required: true,
					})}
				/>
				{errors.phone && (
					<p className={bookingFlowStyles.error}>
						{__('Phone is required', 'wpappointments')}
					</p>
				)}
			</div>
			<div className={bookingFlowStyles.field}>
				<label className={bookingFlowStyles.checkboxLabel}>
					<input
						type="checkbox"
						className={bookingFlowStyles.checkbox}
						{...register('account')}
					/>
					{__('Create account', 'wpappointments')}
				</label>
			</div>
			{account && (
				<div className={bookingFlowStyles.field}>
					<input
						type="password"
						placeholder={__(
							'Password (optional)',
							'wpappointments'
						)}
						className={styles.input}
						{...register('password')}
					/>
					<small className={bookingFlowStyles.fieldInfo}>
						{__(
							'When left blank, password will be generated automatically',
							'wpappointments'
						)}
					</small>
				</div>
			)}
		</div>
	);
}
