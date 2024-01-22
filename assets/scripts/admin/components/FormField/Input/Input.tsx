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
import { __ } from '@wordpress/i18n';
import { InputControl } from '~/utils/experimental';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';
import { fieldLabel } from '../FormField.module.css';

type Props<T extends FieldValues> = {
	name: Path<T>;
	label: string;
	type?: 'text' | 'number' | 'email' | 'password';
	placeholder: string;
	rules?: Omit<
		RegisterOptions<T, Path<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<T, Path<T>>;
};

export type FormFieldError<T extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[string]>>
	| undefined;

export default function Input<T extends FieldValues>({
	label,
	name,
	type = 'text',
	placeholder,
	rules,
	defaultValue,
}: Props<T>) {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const error: FormFieldError<T> = errors[name];

	return (
		<FormField>
			<label className={fieldLabel} htmlFor={name}>
				{label}
				{rules?.required && '*'}
			</label>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange, onBlur } }) => (
					<InputControl
						placeholder={placeholder}
						onBlur={onBlur}
						onChange={onChange}
						value={value}
						size="__unstable-large"
						id={name}
						type={type}
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
