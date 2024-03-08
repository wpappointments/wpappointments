import type { ReactNode } from 'react';
import styles from './Table.module.css';

type TableProps = {
	children: ReactNode;
};

export default function Table({ children }: TableProps) {
	return <table className={styles.table}>{children}</table>;
}
