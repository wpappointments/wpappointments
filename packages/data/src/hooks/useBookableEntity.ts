import { useState, useEffect, useCallback } from 'react';
import { fetchBookable } from '../api';
import type { BookableEntity } from '../types';

export function useBookableEntity(id: number) {
	const [entity, setEntity] = useState<BookableEntity | null>(null);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!id) {
			setEntity(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		const result = await fetchBookable(id);

		if (result.data) {
			setEntity(result.data);
		}
		setLoading(false);
	}, [id]);

	useEffect(() => {
		load();
	}, [load]);

	return {
		entity,
		loading,
		reload: load,
	};
}
