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
import { __ } from '@wordpress/i18n';
import { NumberControl } from '~/backend/utils/experimental';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	placeholder: string;
	disabled?: boolean;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	min?: number;
	max?: number;
	spinControls?: 'none' | 'custom' | 'native';
	onChange?: (e: number | undefined) => void;
	defaultValue?: number;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Number<TFields extends FieldValues>({
	label,
	name,
	placeholder,
	rules,
	disabled = false,
	min,
	max,
	spinControls = 'custom',
	onChange: onChangeProp,
	defaultValue,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField>
			{label && (
				<label className={styles.fieldLabel} htmlFor={name}>
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
							onChange(value ? +value : undefined);
							onChangeProp &&
								onChangeProp(value ? +value : undefined);
						}}
						value={value}
						min={min}
						max={max}
						size="__unstable-large"
						id={name}
						spinControls={spinControls}
						disabled={disabled}
						defaultValue={defaultValue}
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
