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
import { getGenericInputErrorMessage } from '~/backend/utils/forms';
import FormField from '../FormField';
import styles from '../FormField.module.css';

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
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
						defaultValue={value}
						size="__unstable-large"
						id={name}
						options={options}
						disabled={readOnly}
						suffix={noArrow ? <></> : null}
						style={{ paddingRight: noArrow ? 16 : undefined }}
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
