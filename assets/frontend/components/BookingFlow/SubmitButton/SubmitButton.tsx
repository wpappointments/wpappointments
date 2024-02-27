import cn from '~/backend/utils/cn';
import styles from './SubmitButton.module.css';

export default function SubmitButton({ label = 'Book' }) {
	return (
		<input
			type="submit"
			value={label}
			className={cn({
				'wp-block-button__link': true,
				'wp-block-button': true,
				[styles.submitButton]: true,
			})}
		/>
	);
}
