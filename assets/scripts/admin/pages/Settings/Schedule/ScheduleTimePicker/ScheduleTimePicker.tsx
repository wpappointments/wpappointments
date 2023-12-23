import {
	timePicker,
	timePickerControl,
	timePickerSeparator,
} from './ScheduleTimePicker.module.css';
import Number from '~/admin/components/FormField/Number/Number';

type Props = {
	control: any;
	errors: any;
	day: string;
	index: number;
	values: any;
	enabled: boolean;
	updateWorkingHoursTime: any;
	type: 'start' | 'end';
};

export default function ScheduleTimePicker({
	control,
	errors,
	day,
	index,
	values,
	enabled,
	updateWorkingHoursTime,
	type,
}: Props) {
	return (
		<div className={timePicker}>
			<div className={timePickerControl}>
				<Number
					control={control}
					errors={errors}
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
				<span className={timePickerSeparator}>:</span>
				<Number
					control={control}
					errors={errors}
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
