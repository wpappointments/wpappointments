import { useEffect } from 'react';
import {
	Controller,
	DeepRequired,
	FieldError,
	FieldErrorsImpl,
	FieldValues,
	Merge,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { DateTimePickerProps } from '@wordpress/components/build-types/date-time/types';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';
import WPDatePicker from '../WPDatePicker/WPDatePicker';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	onMonthPreviewed?: (date: Date) => void;
} & DateTimePickerProps;

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function DatePicker<TFields extends FieldValues>({
	label,
	name,
	rules,
	defaultValue,
	isInvalidDate,
	events,
	startOfWeek,
	onMonthPreviewed,
}: Props<TFields>) {
	const {
		control,
		setValue,
		formState: { errors },
	} = useFormContext();

	const error: FormFieldError<TFields> = errors[name];

	useEffect(() => {
		if (defaultValue) {
			setValue(name, defaultValue);
		}
	}, []);

	return (
		<FormField>
			<Controller
				name={name}
				control={control}
				rules={rules}
				render={({ field: { value, onChange } }) => (
					<WPDatePicker
						onChange={onChange}
						currentDate={value}
						isInvalidDate={isInvalidDate}
						startOfWeek={startOfWeek}
						events={events}
						onMonthPreviewed={onMonthPreviewed}
					/>
				)}
			/>
			{error && (
				<p style={{ marginBottom: 0, color: 'red' }}>
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
