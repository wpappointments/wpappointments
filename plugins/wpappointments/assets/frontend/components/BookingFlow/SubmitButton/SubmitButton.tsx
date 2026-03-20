import { __ } from '@wordpress/i18n';
import cn from 'obj-str';
import styles from './SubmitButton.module.css';

export default function SubmitButton({ label = __('Book', 'wpappointments') }) {
	return (
		<button
			type="submit"
			className={cn({
				'wp-block-button__link': true,
				'wp-block-button': true,
				[styles.submitButton]: true,
			})}
		>
			{label}
		</button>
	);
}
