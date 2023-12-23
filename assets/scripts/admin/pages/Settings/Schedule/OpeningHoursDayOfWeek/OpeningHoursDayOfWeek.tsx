import { Button, Dashicon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import { produce } from 'immer';
import cn from '~/utils/cn';
import type { DayOpeningHours } from '~/store/settings/settings.types';
import { store } from '~/store/store';
import ScheduleTimePicker from '../ScheduleTimePicker/ScheduleTimePicker';
import {
	copyToAllDays,
	copyToAllDaysWrapper,
	dayLabel,
	fieldGroup,
	fieldGroupRow,
	fieldGroupSpaceBetween,
} from './OpeningHoursDayOfWeek.module.css';
import Toggle from '~/admin/components/FormField/Toggle/Toggle';

export default function OpeningHoursDayOfWeek({
	values,
	showCopyToAllDays = false,
	control,
	errors,
}: {
	values: DayOpeningHours;
	showCopyToAllDays?: boolean;
	control: any;
	errors: any;
}) {
	const {
		updateWorkingHours,
		addWorkingHoursSlot,
		removeWorkingHoursSlot,
		copyWorkingHoursToAllDays,
	} = useDispatch(store);

	const {
		day,
		enabled,
		slots: { list: slots },
	} = values;

	const updateWorkingHoursTime = useCallback(
		({
			values,
			value,
			index,
			type,
		}: {
			values: DayOpeningHours;
			value: string;
			index: number;
			type: 'start' | 'end';
		}) => {
			updateWorkingHours(
				produce(values, (draft) => {
					if (!value) {
						return;
					}

					draft.slots.list[index][type].hour = value;
				})
			);
		},
		[updateWorkingHours]
	);

	const slotTimePicker = useMemo(() => {
		return slots.map((slot, index) => (
			<div
				key={`${index}-${day}-${slot.start.hour}-${slot.start.minute}-${slot.end.hour}-${slot.end.minute}`}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '10px',
				}}
			>
				<ScheduleTimePicker
					{...{
						control,
						errors,
						day,
						index,
						values,
						enabled,
						updateWorkingHoursTime,
						type: 'start',
					}}
				/>
				—
				<ScheduleTimePicker
					{...{
						control,
						errors,
						day,
						index,
						values,
						enabled,
						updateWorkingHoursTime,
						type: 'end',
					}}
				/>
				{enabled && index > 0 && (
					<Button
						type="submit"
						size="small"
						variant="tertiary"
						isDestructive={true}
						onClick={() => {
							removeWorkingHoursSlot(day, index);
						}}
					>
						<Dashicon icon="remove" size={14} />
					</Button>
				)}
				{enabled && index === slots.length - 1 && (
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
		));
	}, [slots.length, enabled]);

	return (
		<div
			className={cn({
				[fieldGroup]: true,
				[fieldGroupSpaceBetween]: true,
			})}
		>
			<div className={fieldGroupRow}>
				<div className={dayLabel}>
					<span>{day}:</span>
					<Toggle
						control={control}
						errors={errors}
						name={`${day}.enabled`}
						onChange={(enabled) => {
							updateWorkingHours({
								...values,
								enabled,
							});
						}}
					/>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '5px',
					}}
				>
					{slots && enabled ? (
						slotTimePicker
					) : (
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
				<div className={copyToAllDaysWrapper}>
					<Button
						size="compact"
						variant="link"
						className={copyToAllDays}
						onClick={() => {
							copyWorkingHoursToAllDays(values);
						}}
					>
						Copy to all days
					</Button>
				</div>
			)}
		</div>
	);
}
