import {
	Controller,
	DeepRequired,
	FieldError,
	FieldErrorsImpl,
	FieldValues,
	Merge,
	Path,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	onChange: (e: boolean) => void;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Toggle<TFields extends FieldValues>({
	label,
	name,
	rules,
	onChange: onChangeProp,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

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
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
