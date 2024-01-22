import { useEffect } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';

export default function useFillFormValues(fields: FieldValues) {
	const { setValue } = useFormContext();

	useEffect(() => {
		for (const [key, field] of Object.entries(fields)) {
			setValue(key, field);
		}
	}, [fields]);
}
