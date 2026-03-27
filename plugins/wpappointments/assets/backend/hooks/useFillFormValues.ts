import { useEffect, useRef } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';

export default function useFillFormValues(fields?: FieldValues) {
	const { setValue } = useFormContext();
	const serialized = fields ? JSON.stringify(fields) : undefined;
	const prevSerialized = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!fields) {
			prevSerialized.current = undefined;
			return;
		}
		if (serialized === prevSerialized.current) return;
		prevSerialized.current = serialized;
		for (const [key, field] of Object.entries(fields)) {
			setValue(key, field);
		}
	}, [serialized]);
}
