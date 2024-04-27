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
import { NumberControl } from '~/backend/utils/experimental';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	min?: number;
	max?: number;
	step?: number;
	spinControls?: 'none' | 'custom' | 'native';
	onChange?: (e: number | undefined) => void;
	defaultValue?: PathValue<TFields, Path<TFields>>;
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
	step,
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
				defaultValue={defaultValue}
				render={({ field: { value, onChange, onBlur } }) => (
					<NumberControl
						onBlur={onBlur}
						onChange={(value) => {
							onChange(value ? +value : undefined);
							onChangeProp &&
								onChangeProp(value ? +value : undefined);
						}}
						value={value}
						min={min}
						max={max}
						step={step}
						size="__unstable-large"
						id={name}
						spinControls={spinControls}
						disabled={disabled}
						placeholder={placeholder}
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
