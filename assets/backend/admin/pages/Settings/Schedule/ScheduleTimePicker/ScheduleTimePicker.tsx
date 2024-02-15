import styles from './ScheduleTimePicker.module.css';
import Number from '~/backend/admin/components/FormField/Number/Number';

type Props = {
	day: string;
	index: number;
	values: any;
	enabled: boolean;
	updateWorkingHoursTime: any;
	type: 'start' | 'end';
};

export default function ScheduleTimePicker({
	day,
	index,
	values,
	enabled,
	updateWorkingHoursTime,
	type,
}: Props) {
	return (
		<div className={styles.timePicker}>
			<div className={styles.timePickerControl}>
				<Number
					key={`${day}.slots.list.${index}.${type}.hour`}
					name={`${day}.slots.list.${index}.${type}.hour`}
					placeholder="00"
					min={0}
					max={23}
					spinControls="none"
					disabled={!enabled}
					onChange={(value) => {
						if (!value) {
							return;
						}

						updateWorkingHoursTime({
							values,
							value,
							index,
							type,
						});
					}}
				/>
				<span className={styles.timePickerSeparator}>:</span>
				<Number
					key={`${day}.slots.list.${index}.${type}.minute`}
					name={`${day}.slots.list.${index}.${type}.minute`}
					placeholder="00"
					min={0}
					max={59}
					spinControls="none"
					disabled={!enabled}
				/>
			</div>
		</div>
	);
}
