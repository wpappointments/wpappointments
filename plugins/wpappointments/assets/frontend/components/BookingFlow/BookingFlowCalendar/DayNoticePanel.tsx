import { useEffect, useRef } from 'react';
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
	onDismiss: () => void;
};

export default function DayNoticePanel({ notices, onDismiss }: Props) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onDismiss();
			}
		}

		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [onDismiss]);

	return (
		<div ref={ref} className={styles.noticeOverlay}>
			{notices.map((notice, i) => {
				const reasonLabel =
					REASON_LABELS[notice.reason || ''] ||
					REASON_LABELS.unspecified;

				return (
					<div key={i} className={styles.noticeItem}>
						<strong>{reasonLabel}</strong>
						{notice.note ? `: ${notice.note}` : ''}
					</div>
				);
			})}
		</div>
	);
}
