import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { TextareaControl } from '@wordpress/components';
import FieldMessages from '../../FieldMessages/FieldMessages';
import { getGenericInputErrorMessage } from '../../utils/forms';
import type { FormFieldError } from '../../utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

export type { FormFieldError };

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	placeholder?: string;
	rows?: number;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	help?: string;
};

export default function Textarea<TFields extends FieldValues>({
	name,
	label,
	placeholder,
	rows = 4,
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
		<FormField>
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
					<TextareaControl
						placeholder={placeholder}
						onBlur={onBlur}
						onChange={onChange}
						value={value ?? ''}
						id={name}
						rows={rows}
						__nextHasNoMarginBottom
					/>
				)}
			/>
			<FieldMessages
				error={getGenericInputErrorMessage(error)}
				help={help}
			/>
		</FormField>
	);
}
