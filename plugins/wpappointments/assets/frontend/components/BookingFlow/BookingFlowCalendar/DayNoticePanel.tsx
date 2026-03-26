import { __ } from '@wordpress/i18n';
import { format } from 'date-fns';
import styles from './BookingFlowCalendar.module.css';
import type { DayNotice } from '~/frontend/frontend';

type Props = {
	date: Date;
	notices: DayNotice[];
};

export default function DayNoticePanel({ date, notices }: Props) {
	return (
		<div className={styles.noticePanel}>
			<h5 className={styles.timeSlotHeader}>{format(date, 'LLLL do')}</h5>
			{notices.map((notice, i) => (
				<div key={i} className={styles.noticeItem}>
					{notice.type === 'ooo' && (
						<span className={styles.noticeBadge}>
							{__('Out of Office', 'wpappointments')}
						</span>
					)}
					{notice.type === 'holiday' && (
						<span className={styles.noticeBadgeHoliday}>
							{__('Holiday', 'wpappointments')}
						</span>
					)}
					{notice.note && (
						<p className={styles.noticeText}>{notice.note}</p>
					)}
				</div>
			))}
		</div>
	);
}
