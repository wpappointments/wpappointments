import { __ } from '@wordpress/i18n';
import cn from 'obj-str';
import styles from './SubmitButton.module.css';

export default function SubmitButton({
	label = __('Book', 'appointments-booking'),
}) {
	return (
		<div className="wp-block-button">
			<button
				type="submit"
				className={cn({
					'wp-block-button__link': true,
					'wp-element-button': true,
					[styles.submitButton]: true,
				})}
			>
				{label}
			</button>
		</div>
	);
}
