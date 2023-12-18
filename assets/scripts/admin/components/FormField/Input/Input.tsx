import {
	Control,
	Controller,
	DeepRequired,
	FieldError,
	FieldErrors,
	FieldErrorsImpl,
	FieldValues,
	Merge,
	Path,
	RegisterOptions,
} from 'react-hook-form';
import { __ } from '@wordpress/i18n';
import { InputControl } from '~/utils/experimental';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';

type Props<T extends FieldValues> = {
	control: Control<T, any>;
	errors: FieldErrors<T>;
	name: Path<T>;
	label: string;
	placeholder: string;
	rules?: Omit<
		RegisterOptions<T, Path<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
};

export type FormFieldError<T extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[string]>>
	| undefined;

export default function Input<T extends FieldValues>({
	control,
	errors,
	label,
	name,
	placeholder,
	rules,
}: Props<T>) {
	const error: FormFieldError<T> = errors[name];

	return (
		<FormField>
			<label htmlFor={name}>
				{label}
				{rules?.required && '*'}
			</label>
			<Controller
				name={name}
				control={control}
				rules={rules}
				render={({ field: { value, onChange, onBlur } }) => (
					<InputControl
						placeholder={placeholder}
						onBlur={onBlur}
						onChange={onChange}
						value={value}
						size="__unstable-large"
						id={name}
					/>
				)}
			/>
			{error && (
				<p style={{ marginTop: 0, color: 'red' }}>
					{getGenericInputErrorMessage<T>(error)}
				</p>
			)}
		</FormField>
	);
}
