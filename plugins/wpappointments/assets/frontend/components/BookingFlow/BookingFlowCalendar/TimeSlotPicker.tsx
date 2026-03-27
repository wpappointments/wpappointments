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
	defaultLength: number;
	onSelectSlot: (isoString: string) => void;
};

export default function TimeSlotPicker({
	date,
	slots,
	datetime,
	alignment,
	slotsAsButtons,
	defaultLength,
	onSelectSlot,
}: Props) {
	return (
		<>
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
				<div>
					<span>{__('Selected time:', 'wpappointments')}</span>{' '}
					<strong>
						{format(new Date(datetime), 'LLLL do, HH:mm')}
					</strong>
				</div>
			)}
		</>
	);
}
