import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
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
			<FieldMessages error={getGenericInputErrorMessage(error)} />
		</FormField>
	);
}
