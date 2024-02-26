import { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
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
	const userDiffTimezone = userSiteTimezoneMatch();

	return (
		<Card className={styles.summary}>
			<CardHeader className={styles.summaryHeader}>
				{__('Date and time summary', 'wpappointments')}: {headerActions}
			</CardHeader>
			<CardBody className={styles.summaryBody}>
				<div className={styles.summaryRow}>
					<strong>{__('Date', 'wpappointments')}</strong>{' '}
					{date.toLocaleDateString('pl-PL')}
				</div>
				<div className={styles.summaryRow}>
					<strong>{__('Time', 'wpappointments')}</strong>{' '}
					{__(
						sprintf(
							'%s to %s',
							sprintf('%s:%s', timeHourStart, timeMinuteStart),
							sprintf('%s:%s', timeHourEnd, timeMinuteEnd)
						),
						'wpappointments'
					)}
					{userDiffTimezone && ` (${userDiffTimezone})`}
				</div>
				<div className={styles.summaryRow}>
					<strong>{__('Duration', 'wpappointments')}</strong>{' '}
					{duration} minutes
				</div>

				{isDateOutsideWorkingHours && (
					<div
						className={cn({
							[styles.summaryRow]: true,
							[styles.summaryRowError]: true,
						})}
					>
						{__(
							'Warning: Selected time is already booked or outside of working hours',
							'wpappointments'
						)}
					</div>
				)}
			</CardBody>
		</Card>
	);
}
