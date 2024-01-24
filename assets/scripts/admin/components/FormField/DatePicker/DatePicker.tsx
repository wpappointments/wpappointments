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
import { getGenericInputErrorMessage } from '~/utils/forms';
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
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange } }) => (
					<WPDatePicker
						onChange={onChange}
						currentDate={value}
						isInvalidDate={(date) => {
							return (
								new Date() > date ||
								date.getDay() === 0 ||
								date.getDay() === 6
							);
						}}
						startOfWeek={1}
						events={[
							{
								date: new Date('2024-01-22T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-24T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-26T21:22:50.694Z'),
							},
							{
								date: new Date('2024-01-28T21:22:50.694Z'),
							},
						]}
					/>
				)}
			/>
			{error && (
				<p style={{ marginTop: 0, color: 'red' }}>
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
