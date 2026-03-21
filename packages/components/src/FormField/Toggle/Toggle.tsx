import {
	Controller,
	FieldValues,
	Path,
	PathValue,
	RegisterOptions,
	useFormContext,
} from 'react-hook-form';
import { ToggleControl } from '@wordpress/components';
import { getGenericInputErrorMessage } from '../../utils/forms';
import type { FormFieldError } from '../../utils/forms';
import FormField from '../FormField';

export type { FormFieldError };

type Props<TFields extends FieldValues> = {
	name: Path<TFields>;
	label?: string;
	rules?: Omit<
		RegisterOptions<TFields, Path<TFields>>,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
	defaultChecked: boolean;
	onChange: (e: boolean) => void;
};

export default function Toggle<TFields extends FieldValues>({
	label,
	name,
	rules,
	defaultChecked,
	onChange: onChangeProp,
}: Props<TFields>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<TFields>();

	const error: FormFieldError<TFields> = errors[name];

	return (
		<FormField>
			<Controller
				name={name}
				control={control}
				rules={rules}
				defaultValue={
					defaultChecked as PathValue<TFields, Path<TFields>>
				}
				render={({ field: { value, onChange, onBlur } }) => (
					<ToggleControl
						onBlur={onBlur}
						onChange={(e) => {
							onChange(e);
							onChangeProp(e);
						}}
						checked={value}
						label={label && `${label}${rules?.required ? '*' : ''}`}
						id={name}
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
