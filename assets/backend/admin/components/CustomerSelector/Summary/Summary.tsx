import { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Customer } from '~/backend/types';
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
					<div className={styles.summaryCustomerName}>
						<strong>{customer.name}</strong>
					</div>
					{(customer.email || customer.phone) && (
					<span>
						{customer.email && (
							<>
								mail:{' '}
								<a href={`mailto:${customer.email}`} target="_blank">
									{customer.email}
								</a>{' '}|{' '}
							</>
						)}
						{customer.phone && (
							<>
								phone:{' '}
								<a href={`tel:${customer.phone}`}>{customer.phone}</a>
							</>
						)}
					</span>
					)}
				</div>
			</CardBody>
		</Card>
	);
}
