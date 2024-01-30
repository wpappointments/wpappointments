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

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label: string;
	type?: 'text' | 'number' | 'email' | 'password';
	placeholder: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Input<TFields extends FieldValues>({
	label,
	name,
	type = 'text',
	placeholder,
	rules,
	defaultValue,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

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
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
