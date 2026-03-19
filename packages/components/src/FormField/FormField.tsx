import cn from 'obj-str';
import styles from './FormField.module.css';

type Props = {
	children: React.ReactNode;
	className?: string;
	isFullWidth?: boolean;
	style?: React.CSSProperties;
};

export default function FormField({
	children,
	className,
	isFullWidth = false,
	style,
}: Props) {
	return (
		<div
			className={cn({
				[styles.field]: true,
				[className || '']: true,
				[styles.fieldFullWidth]: isFullWidth,
			})}
			style={style}
		>
			{children}
		</div>
	);
}

export { styles as formFieldStyles };
