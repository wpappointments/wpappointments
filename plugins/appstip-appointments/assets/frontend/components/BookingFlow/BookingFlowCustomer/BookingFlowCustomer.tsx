import { __ } from '@wordpress/i18n';
import bookingFlowStyles from '../BookingFlow.module.css';
import styles from './BookingFlowCustomer.module.css';
import { useBookingFlowContext } from '~/frontend/context/BookingFlowContext';

export default function BookingFlowCustomer() {
	const { formData, setField } = useBookingFlowContext();

	return (
		<div className={bookingFlowStyles.fields}>
			<div className={bookingFlowStyles.field}>
				<input
					type="text"
					placeholder={__('First name', 'appstip-appointments')}
					className={styles.input}
					value={formData.firstName}
					onChange={(e) => setField('firstName', e.target.value)}
					required
				/>
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="text"
					placeholder={__('Last name', 'appstip-appointments')}
					className={styles.input}
					value={formData.lastName}
					onChange={(e) => setField('lastName', e.target.value)}
					required
				/>
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="email"
					placeholder={__('Email', 'appstip-appointments')}
					className={styles.input}
					value={formData.email}
					onChange={(e) => setField('email', e.target.value)}
					required
				/>
			</div>
			<div className={bookingFlowStyles.field}>
				<input
					type="tel"
					placeholder={__('Phone', 'appstip-appointments')}
					className={styles.input}
					value={formData.phone}
					onChange={(e) => setField('phone', e.target.value)}
					required
				/>
			</div>
			<div className={bookingFlowStyles.field}>
				<label className={bookingFlowStyles.checkboxLabel}>
					<input
						type="checkbox"
						className={bookingFlowStyles.checkbox}
						checked={formData.account}
						onChange={(e) => setField('account', e.target.checked)}
					/>
					{__('Create account', 'appstip-appointments')}
				</label>
			</div>
			{formData.account && (
				<div className={bookingFlowStyles.field}>
					<input
						type="password"
						placeholder={__(
							'Password (optional)',
							'appstip-appointments'
						)}
						className={styles.input}
						value={formData.password || ''}
						onChange={(e) => setField('password', e.target.value)}
					/>
					<small className={bookingFlowStyles.fieldInfo}>
						{__(
							'When left blank, password will be generated automatically',
							'appstip-appointments'
						)}
					</small>
				</div>
			)}
		</div>
	);
}
