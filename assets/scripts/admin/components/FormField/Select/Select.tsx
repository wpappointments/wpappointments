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
	PathValue,
	RegisterOptions,
} from 'react-hook-form';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';
import { fieldLabel } from '../FormField.module.css';

type Props<T extends FieldValues> = {
	control: Control<T, any>;
	errors: FieldErrors<T>;
	name: Path<T>;
	label: string;
	rules?: Omit<
		RegisterOptions<T, Path<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<T, Path<T>>;
	options: {
		label: string;
		value: string;
	}[];
	onChange?: (value: string) => void;
};

export type FormFieldError<T extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[string]>>
	| undefined;

export default function Select<T extends FieldValues>({
	control,
	errors,
	label,
	name,
	rules,
	options,
	defaultValue,
	onChange,
}: Props<T>) {
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
				render={({
					field: {
						value,
						onChange: fieldOnChange,
						onBlur: fieldOnBlur,
					},
				}) => (
					<SelectControl
						onBlur={() => {
							fieldOnBlur();
						}}
						onChange={(e) => {
							fieldOnChange(e);

							if (onChange) {
								onChange(e);
							}
						}}
						value={value}
						size="__unstable-large"
						id={name}
						options={options}
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
