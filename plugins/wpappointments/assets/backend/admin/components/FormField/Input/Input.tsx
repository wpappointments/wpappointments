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
import { InputControl } from '~/backend/utils/experimental';
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	type?: 'text' | 'number' | 'email' | 'password' | 'hidden';
	placeholder?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	help?: string;
};

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export default function Input<TFields extends FieldValues>({
	name,
	label,
	type = 'text',
	placeholder,
	rules,
	defaultValue,
	help,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField
			style={{
				display:
					type === 'hidden' ? (error ? 'block' : 'none') : 'block',
			}}
		>
			{label && (
				<label
					className={styles.fieldLabel}
					htmlFor={name || undefined}
				>
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
					<InputControl
						placeholder={placeholder}
						onBlur={onBlur}
						onChange={onChange}
						value={value}
						size="__unstable-large"
						id={name}
						type={type}
						style={{
							display: type === 'hidden' ? 'none' : 'block',
						}}
						help={help}
					/>
				)}
			/>
			{error && (
				<p style={{ marginTop: 0, marginBottom: 0, color: 'red' }}>
					{getGenericInputErrorMessage<TFields>(error)}
				</p>
			)}
		</FormField>
	);
}
