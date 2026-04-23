import type { FieldValidity } from '@wordpress/dataviews';

const VALIDITY_RULES = [
	'required',
	'pattern',
	'min',
	'max',
	'minLength',
	'maxLength',
	'elements',
	'custom',
] as const;

/**
 * Extract the first error message from a DataForm FieldValidity object.
 * Returns the message string if invalid, or false if no errors.
 */
export function getFirstError(validity?: FieldValidity): string | false {
	if (!validity) {
		return false;
	}

	for (const key of VALIDITY_RULES) {
		const rule = validity[key];
		if (rule?.type === 'invalid') {
			return rule.message || '';
		}
	}

	return false;
}
