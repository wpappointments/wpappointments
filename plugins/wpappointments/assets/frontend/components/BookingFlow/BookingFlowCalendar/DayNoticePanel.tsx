import { __ } from '@wordpress/i18n';
import styles from './BookingFlowCalendar.module.css';
import type { DayNotice } from '~/frontend/frontend';

const REASON_LABELS: Record<string, string> = {
	unspecified: __('Time off', 'wpappointments'),
	vacation: __('Vacation', 'wpappointments'),
	travel: __('Travel', 'wpappointments'),
	sick_leave: __('Sick Leave', 'wpappointments'),
	holiday: __('Holiday', 'wpappointments'),
};

type Props = {
	notices: DayNotice[];
};

export default function DayNoticePanel({ notices }: Props) {
	return (
		<div className={styles.noticePanel}>
			{notices.map((notice, i) => {
				const reasonLabel =
					REASON_LABELS[notice.reason || ''] ||
					REASON_LABELS.unspecified;

				return (
					<h5 key={i} className={styles.noticeText}>
						<strong>{reasonLabel}</strong>
						{notice.note ? `: ${notice.note}` : ''}
					</p>
				);
			})}
		</div>
	);
}
