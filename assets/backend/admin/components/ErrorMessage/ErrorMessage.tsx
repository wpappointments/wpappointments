import { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

export type ErrorMessageProps = {
	children: ReactNode;
};

export default function ErrorMessage({ children }: ErrorMessageProps) {
	return <div className={styles.error}>{children}</div>;
}
