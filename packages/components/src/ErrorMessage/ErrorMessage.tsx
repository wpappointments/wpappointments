import { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

export type ErrorMessageProps = {
	children: ReactNode;
	className?: string;
};

export default function ErrorMessage({
	children,
	className,
}: ErrorMessageProps) {
	return <div className={`${styles.error} ${className}`}>{children}</div>;
}
