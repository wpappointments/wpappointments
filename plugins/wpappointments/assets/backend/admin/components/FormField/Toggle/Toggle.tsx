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
import { ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultChecked: boolean;
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
	defaultChecked,
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
				defaultValue={
					defaultChecked as PathValue<TFields, Path<TFields>>
				}
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
