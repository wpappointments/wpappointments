import { useFormContext } from 'react-hook-form';
import { Button, Dashicon } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { produce } from 'immer';
import cn from '~/backend/utils/cn';
import type { DayOpeningHours } from '~/backend/store/settings/settings.types';
import { store } from '~/backend/store/store';
import { ScheduleFormFields } from '../Schedule';
import ScheduleTimePicker from '../ScheduleTimePicker/ScheduleTimePicker';
import styles from './OpeningHoursDayOfWeek.module.css';
import Toggle from '~/backend/admin/components/FormField/Toggle/Toggle';

export default function OpeningHoursDayOfWeek({
	values,
	showCopyToAllDays = false,
	timePickerPrecision,
}: {
	values: DayOpeningHours;
	showCopyToAllDays?: boolean;
	timePickerPrecision?: number;
}) {
	const { setValue, reset } = useFormContext<ScheduleFormFields>();

	const {
		updateWorkingHours,
		addWorkingHoursSlot,
		removeWorkingHoursSlot,
		copyWorkingHoursToAllDays,
	} = useDispatch(store);

	const settings = useSelect(() => {
		return select(store).getAllSettings();
	}, []);

	const { schedule } = settings;

	const { day, enabled, allDay, slots } = values;

	const { list } = slots || { list: [] };

	const updateWorkingHoursTime = useCallback(
		({
			values,
			value,
			index,
			type,
			time,
		}: {
			values: DayOpeningHours;
			value: string;
			index: number;
			type: 'start' | 'end';
			time: 'hour' | 'minute';
		}) => {
			updateWorkingHours(
				produce(values, (draft) => {
					if (!value) {
						return;
					}

					if (!draft.slots) {
						draft.slots = {
							list: [
								{
									start: {
										hour: null,
										minute: null,
									},
									end: {
										hour: null,
										minute: null,
									},
								},
							],
						};
					}

					draft.slots.list[index][type][time] = value;
				})
			);
		},
		[updateWorkingHours]
	);

	return (
		<div
			className={cn({
				[styles.fieldGroup]: true,
				[styles.fieldGroupSpaceBetween]: true,
			})}
		>
			<div className={styles.fieldGroupRow}>
				<div>
					<div className={styles.dayLabel}>
						<span>{day}:</span>
						<Toggle
							name={`${day}.enabled`}
							onChange={(enabled) => {
								const newValues = {
									...values,
									enabled,
								};

								if (!enabled) {
									newValues.allDay = false;
								}

								updateWorkingHours(newValues);
							}}
							defaultChecked={true}
						/>
					</div>
					{enabled && (
						<div className={styles.allDayLabel}>
							<span>{__('All day', 'wpappointments')}:</span>
							<Toggle
								name={`${day}.allDay`}
								onChange={(allDay) => {
									updateWorkingHours({
										...values,
										allDay,
									});
								}}
								defaultChecked={false}
							/>
						</div>
					)}
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '5px',
					}}
				>
					{!allDay &&
						enabled &&
						list.map((slot, index) => (
							<div
								key={`${index}-${day}-${slot.start.hour}-${slot.start.minute}-${slot.end.hour}-${slot.end.minute}`}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '10px',
								}}
							>
								<ScheduleTimePicker
									day={day}
									index={index}
									type="start"
									timePickerPrecision={timePickerPrecision}
									updateWorkingHoursTime={
										updateWorkingHoursTime
									}
								/>
								—
								<ScheduleTimePicker
									day={day}
									index={index}
									type="end"
									timePickerPrecision={timePickerPrecision}
									updateWorkingHoursTime={
										updateWorkingHoursTime
									}
									minHour={slot.start.hour}
								/>
								{enabled && index > 0 && (
									<Button
										type="submit"
										size="small"
										variant="tertiary"
										isDestructive={true}
										onClick={() => {
											removeWorkingHoursSlot(day, index);
											reset();
										}}
									>
										<Dashicon icon="remove" size={14} />
									</Button>
								)}
								{enabled && index === list.length - 1 && (
									<Button
										type="submit"
										size="small"
										variant="tertiary"
										onClick={() => {
											addWorkingHoursSlot(day);
										}}
									>
										<Dashicon icon="plus-alt" size={15} />
									</Button>
								)}
							</div>
						))}
					{!enabled && (
						<div
							style={{
								height: '100%',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							Not available
						</div>
					)}
				</div>
			</div>
			{showCopyToAllDays && (
				<div className={styles.copyToAllDaysWrapper}>
					<Button
						size="compact"
						variant="link"
						className={styles.copyToAllDays}
						onClick={() => {
							copyWorkingHoursToAllDays(values);

							const days = Object.keys(schedule) as Array<
								keyof typeof schedule
							>;
							const slots = values.slots.list[0];

							reset();

							for (const day of days) {
								setValue(
									`${day}.slots.list.0.start.hour`,
									slots.start.hour
								);
								setValue(
									`${day}.slots.list.0.start.minute`,
									slots.start.minute
								);
								setValue(
									`${day}.slots.list.0.end.hour`,
									slots.end.hour
								);
								setValue(
									`${day}.slots.list.0.end.minute`,
									slots.end.minute
								);
							}
						}}
					>
						Copy to all days
					</Button>
				</div>
			)}
		</div>
	);
}
