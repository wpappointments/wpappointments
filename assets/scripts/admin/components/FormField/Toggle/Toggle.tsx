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
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';

type Props<T extends FieldValues> = {
	control: Control<T, any>;
	errors: FieldErrors<T>;
	name: Path<T>;
	label?: string;
	rules?: Omit<
		RegisterOptions<T, Path<T>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	onChange: (e: boolean) => void;
};

export type FormFieldError<T extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<T>[string]>>
	| undefined;

export default function Toggle<T extends FieldValues>({
	control,
	errors,
	label,
	name,
	rules,
	onChange: onChangeProp,
}: Props<T>) {
	const error: FormFieldError<T> = errors[name];

	return (
		<FormField>
			<Controller
				name={name}
				control={control}
				rules={rules}
				render={({ field: { value, onChange, onBlur } }) => (
					<ToggleControl
						onBlur={onBlur}
						onChange={(e) => {
							onChange(e);
							onChangeProp(e);
						}}
						checked={value}
						label={label && `${label}${rules?.required ? '*' : ''}`}
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
