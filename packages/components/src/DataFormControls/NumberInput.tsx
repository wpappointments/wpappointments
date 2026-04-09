/**
 * DataForm-compatible number input control
 *
 * Implements the DataForm Edit component interface
 * with FormField + NumberControl styling.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { __experimentalNumberControl as NumberControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import styles from '../FormField/FormField.module.css';
import { getFirstError } from './utils';

export default function NumberInput<Item>({
	data,
	field,
	onChange,
	hideLabelFromVision,
	validity,
}: DataFormControlProps<Item>) {
	const { id, label, placeholder, description, getValue, setValue, isValid } =
		field;
	const value = getValue({ item: data }) ?? '';
	const required = !!isValid?.required;
	const error = getFirstError(validity);

	const onChangeControl = useCallback(
		(newValue: string | undefined) => {
			const numeric =
				newValue === undefined || newValue === ''
					? undefined
					: Number(newValue);
			onChange(setValue({ item: data, value: numeric }));
		},
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
			<NumberControl
				label={hideLabelFromVision ? label : undefined}
				hideLabelFromVision={hideLabelFromVision}
				placeholder={placeholder}
				onChange={onChangeControl}
				value={value}
				size="__unstable-large"
				id={id}
				min={isValid?.min?.constraint}
				max={isValid?.max?.constraint}
			/>
			<FieldMessages error={error} help={description} />
		</FormField>
	);
}
