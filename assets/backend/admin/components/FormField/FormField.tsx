import cn from '~/utils/cn';
import styles from './FormField.module.css';

type Props = {
	children: React.ReactNode;
	className?: string;
	isFullWidth?: boolean;
};

export default function FormField({
	children,
	className,
	isFullWidth = false,
}: Props) {
	return (
		<div
			className={cn({
				[className || '']: true,
				[styles.fieldFullWidth]: isFullWidth,
			})}
		>
			{children}
		</div>
	);
}
