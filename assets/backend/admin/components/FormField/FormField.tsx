import cn from '~/utils/cn';
import { fieldFullWidth } from './FormField.module.css';

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
				[fieldFullWidth]: isFullWidth,
			})}
		>
			{children}
		</div>
	);
}
