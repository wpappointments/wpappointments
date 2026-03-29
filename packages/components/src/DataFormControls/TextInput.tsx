/**
 * DataForm-compatible text input control
 *
 * Uses the same FormField + InputControl styling as the RHF Input component,
 * but implements the DataForm Edit component interface (DataFormControlProps).
 *
 * Supports text, email, telephone, password, and url input types via the
 * field's `type` property.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { __experimentalInputControl as InputControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import styles from '../FormField/FormField.module.css';
import { getFirstError } from './utils';

const TYPE_MAP: Record<string, string> = {
	text: 'text',
	email: 'email',
	telephone: 'tel',
	password: 'password',
	url: 'url',
};

export default function TextInput<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
}: DataFormControlProps<Item>) {
	const { id, label, placeholder, description, getValue, setValue, isValid } =
		field;
	const value = getValue({ item: data }) ?? '';
	const inputType = TYPE_MAP[field.type ?? 'text'] ?? 'text';
	const required = !!isValid?.required;
	const error = getFirstError(validity);

	const onChangeControl = useCallback(
		(newValue: string | undefined) =>
			onChange(setValue({ item: data, value: newValue ?? '' })),
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
			<InputControl
				placeholder={placeholder}
				onChange={onChangeControl}
				value={value}
				size="__unstable-large"
				id={id}
				type={inputType}
			/>
			<FieldMessages error={error} help={description} />
		</FormField>
	);
}
