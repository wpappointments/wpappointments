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
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getGenericInputErrorMessage } from '~/utils/forms';
import FormField from '../FormField';
import { fieldLabel } from '../FormField.module.css';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	options: {
		label: string;
		value: string;
	}[];
	onChange?: (value: string) => void;
	fullWidth?: boolean;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Select<TFields extends FieldValues>({
	label,
	name,
	rules,
	options,
	defaultValue,
	onChange,
	fullWidth = false,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField isFullWidth={fullWidth}>
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
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
