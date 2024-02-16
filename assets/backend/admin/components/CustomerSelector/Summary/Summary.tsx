import { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Customer } from '~/backend/store/customers/customers.types';
import styles from './Summary.module.css';

export type SummaryProps = {
	customer: Customer;
	headerActions?: ReactNode;
};

export default function Summary({ customer, headerActions }: SummaryProps) {
	return (
		<Card className={styles.summary}>
			<CardHeader className={styles.summaryHeader}>
				{__('Selected customer', 'wpappointments')}: {headerActions}
			</CardHeader>
			<CardBody className={styles.summaryBody}>
				<div className={styles.summaryCustomerRow}>
					<div>
						<strong>{customer.name}</strong>
					</div>
					<span>
						mail:{' '}
						<a href={`mailto:${customer.email}`} target="_blank">
							{customer.email}
						</a>{' '}
						| phone:{' '}
						<a href={`tel:${customer.phone}`}>{customer.phone}</a>
					</span>
				</div>
			</CardBody>
		</Card>
	);
}
