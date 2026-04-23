import { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import styles from './Summary.module.css';

export type SummaryProps = {
	headerActions?: ReactNode;
	rows: ReactNode | ReactNode[];
};

export default function Summary({ headerActions, rows }: SummaryProps) {
	return (
		<Card className={styles.summary}>
			<CardHeader className={styles.summaryHeader}>
				{__('Selected customer', 'appointments-booking')}:{' '}
				{headerActions}
			</CardHeader>
			<CardBody className={styles.summaryBody}>{rows}</CardBody>
		</Card>
	);
}
