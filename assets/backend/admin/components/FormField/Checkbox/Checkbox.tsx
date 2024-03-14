import { CSSProperties } from 'react';
import { Controller, DeepRequired, FieldError, FieldErrorsImpl, FieldValues, Merge, Path, PathValue, RegisterOptions, useFormContext } from 'react-hook-form';
import { CheckboxControl } from '@wordpress/components';
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
	style?: CSSProperties;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Checkbox<TFields extends FieldValues>({
	name,
	label,
	rules,
	defaultValue,
	style,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField style={{marginTop: 10, ...style}}>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange, onBlur } }) => (
					<CheckboxControl
						onBlur={onBlur}
						onChange={onChange}
						checked={value}
						id={name}
						label={`${label}${rules?.required ? '*' : ''}`}
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
