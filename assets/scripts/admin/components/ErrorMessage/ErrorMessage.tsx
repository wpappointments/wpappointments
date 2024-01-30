import { ReactNode } from 'react';
import { error } from './ErrorMessage.module.css';

export type ErrorMessageProps = {
	children: ReactNode;
};

export default function ErrorMessage({ children }: ErrorMessageProps) {
	return <div className={error}>{children}</div>;
}
