/**
 * DataForm-compatible select control
 *
 * Uses the same FormField + SelectControl styling as the RHF Select component,
 * but implements the DataForm Edit component interface.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { SelectControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import styles from '../FormField/FormField.module.css';
import { getFirstError } from './utils';

export default function SelectInput<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
	labelInvisible,
}: DataFormControlProps<Item> & { labelInvisible?: boolean }) {
	const { id, label, description, getValue, setValue, isValid, elements } =
		field;
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

	const showLabel = label && !hideLabelFromVision;
	const labelClassName = labelInvisible
		? `${styles.fieldLabel} ${styles.fieldLabelInvisible}`
		: styles.fieldLabel;

	return (
		<FormField>
			{showLabel && (
				<label className={labelClassName} htmlFor={id}>
					{label}
					{required && '*'}
				</label>
			)}
			<SelectControl
				onChange={onChangeControl}
				value={String(value)}
				size="__unstable-large"
				id={id}
				options={options}
			/>
			<FieldMessages error={error} help={description} />
		</FormField>
	);
}
