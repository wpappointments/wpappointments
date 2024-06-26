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
import { RadioControl } from '@wordpress/components';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	placeholder?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	options: Array<{ label: string; value: string }>;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Radio<TFields extends FieldValues>({
	name,
	label,
	rules,
	defaultValue,
	options,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField style={{ marginTop: 10 }}>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange } }) => (
					<RadioControl
						onChange={onChange}
						selected={value}
						label={`${label}${rules?.required ? '*' : ''}`}
						options={options}
					/>
				)}
			/>
			{error && (
				<p style={{ marginTop: 0, marginBottom: 0, color: 'red' }}>
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
