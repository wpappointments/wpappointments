import { __ } from '@wordpress/i18n';
import { addMinutes, format } from 'date-fns';
import cn from 'obj-str';
import { formatTime } from '~/backend/utils/i18n';
import styles from './BookingFlowCalendar.module.css';
import type { DaySlot } from '~/frontend/frontend';

type Props = {
	date: Date;
	slots: DaySlot[];
	datetime: string | undefined;
	alignment: string;
	slotsAsButtons: boolean;
	inline?: boolean;
	defaultLength: number;
	onSelectSlot: (isoString: string) => void;
};

export default function TimeSlotPicker({
	date,
	slots,
	datetime,
	alignment,
	slotsAsButtons,
	inline,
	defaultLength,
	onSelectSlot,
}: Props) {
	if (inline) {
		return (
			<>
				<h5 className={styles.timeSlotHeader}>
					{format(date, 'EEE d')}
				</h5>
				<div className={styles.inlineSlots}>
					{slots.map((slot, i) => {
						const iso = new Date(slot.timestamp).toISOString();
						return (
							<button
								key={i}
								onClick={() => {
									if (!slot.available) return;
									onSelectSlot(iso);
								}}
								type="button"
								className={cn({
									[styles.inlineSlot]: true,
									[styles.inlineSlotSelected]:
										datetime === iso,
									[styles.inlineSlotUnavailable]:
										!slot.available,
								})}
							>
								{slot.time}
							</button>
						);
					})}
				</div>
			</>
		);
	}

	return (
		<div className={styles.timeSlotPicker}>
			<h5 className={styles.timeSlotHeader}>
				{__('Select a time slot for', 'wpappointments')}{' '}
				{format(date, 'LLLL do')}
			</h5>
			<div
				className={cn({
					[styles.daySlots]: true,
					[styles.center]: alignment === 'Center',
					[styles.right]: alignment === 'Right',
					[styles.buttonGroup]: slotsAsButtons,
				})}
			>
				{slots.map((slot, i) => (
					<button
						key={i}
						onClick={() => {
							if (!slot.available) return;
							onSelectSlot(
								new Date(slot.timestamp).toISOString()
							);
						}}
						type="button"
						className={cn({
							[styles.daySlot]: true,
							[styles.isButton]: slotsAsButtons,
							[styles.daySlotAvailable]: slot.available,
							[styles.daySlotSelected]:
								datetime &&
								new Date(slot.timestamp).toISOString() ===
									datetime,
						})}
						data-time={slot.time}
					>
						{slotsAsButtons && (
							<>
								{slot.time} -{' '}
								{formatTime(
									addMinutes(slot.timestamp, defaultLength)
								)}
							</>
						)}
					</button>
				))}
			</div>
			{datetime && (
				<h5 className={styles.timeSlotHeader}>
					<span>{__('Selected time:', 'wpappointments')}</span>{' '}
					<strong>
						{format(new Date(datetime), 'LLLL do')},{' '}
					{formatTime(new Date(datetime))}
					</strong>
				</h5>
			)}
		</div>
	);
}
