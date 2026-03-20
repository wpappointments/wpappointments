import {
	DeepRequired,
	FieldError,
	FieldErrorsImpl,
	FieldValues,
	Merge,
} from 'react-hook-form';
import { __ } from '@wordpress/i18n';

export type FormFieldError<TFields extends FieldValues> =
	| FieldError
	| Merge<FieldError, FieldErrorsImpl<DeepRequired<TFields>[string]>>
	| undefined;

export function getGenericInputErrorMessage<T extends FieldValues>(
	error: FormFieldError<T>
): string | false {
	if (!error) {
		return false;
	}

	switch (error.type) {
		case 'required':
			return __('This field is required.', 'wpappointments');
		case 'minLength':
			return __(
				'This field requires at least {minLength} characters.',
				'wpappointments'
			);
		case 'maxLength':
			return __(
				'This field requires no more than {maxLength} characters.',
				'wpappointments'
			);
		default:
			return __('This field requires attention.', 'wpappointments');
	}
}
