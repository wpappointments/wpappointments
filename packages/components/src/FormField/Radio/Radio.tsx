import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { RadioControl } from '@wordpress/components';
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
	options: Array<{ label: string; value: string }>;
};

export default function Radio<TFields extends FieldValues>({
	name,
	label,
	rules,
	defaultValue,
	options,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField style={{ marginTop: 10 }}>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={defaultValue}
				render={({ field: { value, onChange } }) => (
					<RadioControl
						onChange={onChange}
						selected={value}
						label={`${label}${rules?.required ? '*' : ''}`}
						options={options}
					/>
				)}
			/>
			<FieldMessages error={getGenericInputErrorMessage(error)} />
		</FormField>
	);
}
