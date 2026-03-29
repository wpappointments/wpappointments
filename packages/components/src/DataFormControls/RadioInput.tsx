/**
 * DataForm-compatible radio control
 *
 * Implements the DataForm Edit component interface
 * with FormField + RadioControl styling.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { RadioControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import styles from '../FormField/FormField.module.css';
import { getFirstError } from './utils';

export default function RadioInput<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
}: DataFormControlProps<Item>) {
	const { id, label, getValue, setValue, isValid, elements } = field;
	const value = getValue({ item: data }) ?? '';
	const required = !!isValid?.required;
	const error = getFirstError(validity);

	const options = (elements ?? []).map((el) => ({
		label: el.label,
		value: String(el.value),
	}));

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
			<RadioControl
				onChange={onChangeControl}
				selected={String(value)}
				id={id}
				options={options}
				hideLabelFromVision
				label={label}
			/>
			<FieldMessages error={error} />
		</FormField>
	);
}
