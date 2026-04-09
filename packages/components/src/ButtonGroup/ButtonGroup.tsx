import type { ReactNode } from 'react';
import styles from './ButtonGroup.module.css';

type Props = {
	children: ReactNode;
	className?: string;
};

export default function ButtonGroup({ children, className }: Props) {
	return (
		<div
			role="group"
			className={`${styles.buttonGroup}${className ? ` ${className}` : ''}`}
		>
			{children}
		</div>
	);
}
