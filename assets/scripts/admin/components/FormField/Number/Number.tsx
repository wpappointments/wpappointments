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
import { NumberControl } from '~/utils/experimental';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';

type Props<T extends FieldValues> = {
	control: Control<T, any>;
	errors: FieldErrors<T>;
	name: Path<T>;
	label?: string;
	placeholder: string;
	disabled?: boolean;
	rules?: Omit<
		RegisterOptions<T, Path<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	min?: number;
	max?: number;
	spinControls?: 'none' | 'custom' | 'native';
	onChange?: (e: string | undefined) => void;
};

export type FormFieldError<T extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[string]>>
	| undefined;

export default function Number<T extends FieldValues>({
	control,
	errors,
	label,
	name,
	placeholder,
	rules,
	disabled = false,
	min,
	max,
	spinControls = 'custom',
	onChange: onChangeProp,
}: Props<T>) {
	const error: FormFieldError<T> = errors[name];

	return (
		<FormField>
			{label && (
				<label htmlFor={name}>
					{label}
					{rules?.required && '*'}
				</label>
			)}
			<Controller
				name={name}
				control={control}
				rules={rules}
				render={({ field: { value, onChange, onBlur } }) => (
					<NumberControl
						placeholder={placeholder}
						onBlur={onBlur}
						onChange={(value) => {
							onChange(value);
							onChangeProp && onChangeProp(value);
						}}
						value={value}
						min={min}
						max={max}
						size="__unstable-large"
						id={name}
						spinControls={spinControls}
						disabled={disabled}
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
