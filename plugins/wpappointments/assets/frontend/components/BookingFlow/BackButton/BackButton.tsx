import { __ } from '@wordpress/i18n';
import cn from 'obj-str';
import styles from './BackButton.module.css';

export default function BackButton({
	label = __('Back', 'wpappointments'),
	onClick,
}: {
	label?: string;
	onClick?: () => void;
}) {
	return (
		<div className="wp-block-button is-style-outline is-style-outline--1">
			<button
				type="button"
				className={cn({
					'wp-block-button__link': true,
					'wp-element-button': true,
					[styles.backButton]: true,
				})}
				onClick={onClick}
			>
				{label}
			</button>
		</div>
	);
}
