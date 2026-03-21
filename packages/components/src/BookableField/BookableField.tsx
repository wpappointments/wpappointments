import type { BookableTypeField } from '@wpappointments/data';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField, { formFieldStyles } from '../FormField/FormField';

export default function BookableField({
	field,
	error,
	showLabel = true,
	children,
}: {
	field: BookableTypeField;
	error?: string;
	showLabel?: boolean;
	children: React.ReactNode;
}) {
	return (
		<FormField>
			{showLabel && (
				<label className={formFieldStyles.fieldLabel}>
					{field.label}
					{field.required && '*'}
				</label>
			)}
			{children}
			<FieldMessages error={error} help={field.help} />
		</FormField>
	);
}
