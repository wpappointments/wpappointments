import { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import cn from '~/utils/cn';
import styles from './Summary.module.css';

export type SummaryProps = {
	date: Date;
	timeHourStart: string;
	timeMinuteStart: string;
	timeHourEnd: string;
	timeMinuteEnd: string;
	duration: number;
	isDateOutsideWorkingHours?: boolean;
	headerActions?: ReactNode;
};

export default function Summary({
	date,
	timeHourStart,
	timeMinuteStart,
	timeHourEnd,
	timeMinuteEnd,
	duration,
	isDateOutsideWorkingHours,
	headerActions,
}: SummaryProps) {
	return (
		<Card className={styles.summary}>
			<CardHeader className={styles.summaryHeader}>
				Summmary: {headerActions}
			</CardHeader>
			<CardBody className={styles.summaryBody}>
				<div className={styles.summaryRow}>
					<strong>Date</strong> {date.toLocaleDateString('pl-PL')}
				</div>
				<div className={styles.summaryRow}>
					<strong>Time</strong>{' '}
					{__(
						sprintf(
							'%s to %s',
							sprintf('%s:%s', timeHourStart, timeMinuteStart),
							sprintf('%s:%s', timeHourEnd, timeMinuteEnd)
						)
					)}
				</div>
				<div className={styles.summaryRow}>
					<strong>Duration</strong> {duration} minutes
				</div>

				{isDateOutsideWorkingHours && (
					<div
						className={cn({
							[styles.summaryRow]: true,
							[styles.summaryRowError]: true,
						})}
					>
						{__(
							'Warning: Selected time is already booked or outside of working hours'
						)}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
