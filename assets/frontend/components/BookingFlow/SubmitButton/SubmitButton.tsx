import cn from '~/backend/utils/cn';
import styles from './SubmitButton.module.css';

export default function SubmitButton({ label = 'Book' }) {
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
