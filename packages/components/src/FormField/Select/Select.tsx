import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { SelectControl } from '@wordpress/components';
import cn from 'obj-str';
import FieldMessages from '../../FieldMessages/FieldMessages';
import { getGenericInputErrorMessage } from '../../utils/forms';
import type { FormFieldError } from '../../utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

export type { FormFieldError };

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	labelHidden?: boolean;
	labelInvisible?: boolean;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	options: {
		label: string;
		value: string;
	}[];
	readOnly?: boolean;
	onChange?: (value: string) => void;
	fullWidth?: boolean;
	noArrow?: boolean;
	help?: string;
};

export default function Select<TFields extends FieldValues>({
	label,
	labelHidden = false,
	labelInvisible = false,
	name,
	rules,
	options,
	defaultValue,
	onChange,
	help,
	readOnly = false,
	fullWidth = false,
	noArrow = false,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField isFullWidth={fullWidth}>
			{label && (
				<label
					className={cn({
						[styles.fieldLabel]: true,
						[styles.fieldHiddenLabel]: labelHidden,
						[styles.fieldLabelInvisible]: labelInvisible,
					})}
					htmlFor={name}
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
						value={value ?? ''}
						size="__unstable-large"
						id={name}
						options={options}
						disabled={readOnly}
						suffix={noArrow ? <></> : null}
						style={{ paddingRight: noArrow ? 16 : undefined }}
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
