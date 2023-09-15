import {
	Control,
	Controller,
	DeepRequired,
	FieldError,
	FieldErrors,
	FieldErrorsImpl,
	FieldValues,
	Merge,
	Path,
	RegisterOptions,
} from 'react-hook-form';
import { __ } from '@wordpress/i18n';
import { DateTimePicker as WPDateTimePicker } from '@wordpress/components';
import { getGenericInputErrorMessage } from '../../../../utils/forms';

type Props< T extends FieldValues > = {
	control: Control< T, any >;
	errors: FieldErrors< T >;
	name: Path< T >;
	label: string;
	rules?: Omit<
		RegisterOptions< T, Path< T > >,
		'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
	>;
};

export type FormFieldError< T extends FieldValues > =
	| FieldError
	| Merge< FieldError, FieldErrorsImpl< DeepRequired< T >[ string ] > >
	| undefined;

export default function DateTimePicker< T extends FieldValues >( {
	control,
	errors,
	label,
	name,
	rules,
}: Props< T > ) {
	const error: FormFieldError< T > = errors[ name ];

	return (
		<div className="wpappointments-form-field">
			<Controller
				name={ name }
				control={ control }
				rules={ rules }
				render={ ( { field: { value, onChange } } ) => (
					<WPDateTimePicker
						onChange={ onChange }
						currentDate={ value }
					/>
				) }
			/>
			{ error && (
				<p style={ { marginTop: 0, color: 'red' } }>
					{ getGenericInputErrorMessage< T >( error ) }
				</p>
			) }
		</div>
	);
}
