import { CSSProperties } from 'react';
import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { CheckboxControl } from '@wordpress/components';
import FieldMessages from '../../FieldMessages/FieldMessages';
import { getGenericInputErrorMessage } from '../../utils/forms';
import type { FormFieldError } from '../../utils/forms';
import FormField from '../FormField';

export type { FormFieldError };

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	placeholder?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultValue?: PathValue<TFields, Path<TFields>>;
	style?: CSSProperties;
};

export default function Checkbox<TFields extends FieldValues>({
	name,
	label,
	rules,
	defaultValue,
	style,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField style={{ marginTop: 10, ...style }}>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange, onBlur } }) => (
					<CheckboxControl
						onBlur={onBlur}
						onChange={onChange}
						checked={value}
						id={name}
						label={`${label}${rules?.required ? '*' : ''}`}
					/>
				)}
			/>
			<FieldMessages error={getGenericInputErrorMessage(error)} />
		</FormField>
	);
}
