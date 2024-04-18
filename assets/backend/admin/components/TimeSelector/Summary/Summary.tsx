import { ReactNode } from 'react';
import { Card, CardHeader, CardBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import cn from '~/backend/utils/cn';
import { userSiteTimezoneMatch } from '~/backend/utils/datetime';
import { formatDate, formatTime } from '~/backend/utils/i18n';
import styles from './Summary.module.css';

export type SummaryProps = {
	date: Date;
	timeHourStart: string;
	timeMinuteStart: string;
	timeHourEnd: string;
	timeMinuteEnd: string;
	duration: number;
	showAvailabilityWarning: boolean;
	headerActions?: ReactNode;
};

export default function Summary({
	date,
	timeHourStart,
	timeMinuteStart,
	timeHourEnd,
	timeMinuteEnd,
	duration,
	showAvailabilityWarning,
	headerActions,
}: SummaryProps) {
	const userDiffTimezone = userSiteTimezoneMatch();

	const dateTimeStart = new Date(date);
	dateTimeStart.setHours(parseInt(timeHourStart));
	dateTimeStart.setMinutes(parseInt(timeMinuteStart));

	const dateTimeEnd = new Date(date);
	dateTimeEnd.setHours(parseInt(timeHourEnd));
	dateTimeEnd.setMinutes(parseInt(timeMinuteEnd));

	return (
		<>
			<Card className={styles.summary}>
				<CardHeader className={styles.summaryHeader}>
					{__('Date and time summary', 'wpappointments')}:{' '}
					{headerActions}
				</CardHeader>
				<CardBody className={styles.summaryBody}>
					<div className={styles.summaryRow}>
						<strong>{__('Date', 'wpappointments')}</strong>{' '}
						{date && formatDate(date)}
					</div>
					<div className={styles.summaryRow}>
						<strong>{__('Time', 'wpappointments')}</strong>{' '}
						{/* translators: %s: start time, %s: end time */}
						{sprintf(
							__('%s to %s', 'wpappointments'),
							formatTime(dateTimeStart),
							formatTime(dateTimeEnd)
						)}
						{userDiffTimezone && ` (${userDiffTimezone})`}
					</div>
					<div className={styles.summaryRow}>
						<strong>{__('Duration', 'wpappointments')}</strong>{' '}
						{/* TODO: use _n translation for this */}
						{duration} {__('minutes', 'wpappointments')}
					</div>
				</CardBody>
			</Card>
			{showAvailabilityWarning && (
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
		</>
	);
}
