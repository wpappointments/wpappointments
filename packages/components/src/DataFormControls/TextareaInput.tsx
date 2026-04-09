/**
 * DataForm-compatible textarea control
 *
 * Implements the DataForm Edit component interface
 * with FormField + TextareaControl styling.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { TextareaControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import styles from '../FormField/FormField.module.css';
import { getFirstError } from './utils';

export default function TextareaInput<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
	config,
}: DataFormControlProps<Item>) {
	const { id, label, placeholder, description, getValue, setValue, isValid } =
		field;
	const value = getValue({ item: data }) ?? '';
	const required = !!isValid?.required;
	const error = getFirstError(validity);
	const rows = config?.rows ?? 4;

	const onChangeControl = useCallback(
		(newValue: string) =>
			onChange(setValue({ item: data, value: newValue })),
		[data, setValue, onChange]
	);

	return (
		<FormField>
			{label && !hideLabelFromVision && (
				<label className={styles.fieldLabel} htmlFor={id}>
					{label}
					{required && '*'}
				</label>
			)}
			<TextareaControl
				placeholder={placeholder}
				onChange={onChangeControl}
				value={value}
				id={id}
				rows={rows}
				hideLabelFromVision
				label={label}
			/>
			<FieldMessages error={error} help={description} />
		</FormField>
	);
}
