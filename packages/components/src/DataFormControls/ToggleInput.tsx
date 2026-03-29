/**
 * DataForm-compatible toggle control
 *
 * Implements the DataForm Edit component interface
 * with FormField + ToggleControl styling.
 *
 * @package WPAppointments
 */
import { useCallback } from 'react';
import { ToggleControl } from '@wordpress/components';
import type { DataFormControlProps } from '@wordpress/dataviews';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField from '../FormField/FormField';
import { getFirstError } from './utils';

export default function ToggleInput<Item>({
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
		<FormField>
			<ToggleControl
				onChange={onChangeControl}
				checked={value}
				label={label ? `${label}${required ? '*' : ''}` : undefined}
				id={id}
			/>
			<FieldMessages error={error} />
		</FormField>
	);
}
