import type { ReactNode } from 'react';
import styles from './Empty.module.css';

type Props = {
	children: ReactNode;
};

export default function Empty({ children }: Props) {
	return <div className={styles.empty}>{children}</div>;
}
