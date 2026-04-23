/**
 * DataForm-compatible checkbox control
 *
 * Implements the DataForm Edit component interface
 * with FormField + CheckboxControl styling.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { CheckboxControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import { getFirstError } from './utils';

export default function CheckboxInput<Item>({
	data,
	field,
	onChange,
	validity,
}: DataFormControlProps<Item>) {
	const { id, label, getValue, setValue, isValid } = field;
	const value = !!getValue({ item: data });
	const required = !!isValid?.required;
	const error = getFirstError(validity);

	const onChangeControl = useCallback(
		(checked: boolean) =>
			onChange(setValue({ item: data, value: checked })),
		[data, setValue, onChange]
	);

	return (
		<FormField style={{ marginTop: 10 }}>
			<CheckboxControl
				onChange={onChangeControl}
				checked={value}
				id={id}
				label={`${label ?? ''}${required ? '*' : ''}`}
			/>
			<FieldMessages error={error} />
		</FormField>
	);
}
