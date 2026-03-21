import { useState, useEffect, useCallback } from 'react';
import {
	fetchBookables,
	createBookable,
	updateBookable,
	deleteBookable,
} from '../api';
import type { BookableEntity } from '../types';

export function useBookableEntities(
	type: string,
	options?: { postsPerPage?: number; paged?: number }
) {
	const [entities, setEntities] = useState<BookableEntity[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const load = useCallback(async () => {
		setLoading(true);
		const result = await fetchBookables({
			type,
			...options,
		});

		if (result.data) {
			setEntities(result.data.bookables);
			setTotalItems(result.data.totalItems);
			setTotalPages(result.data.totalPages);
		}
		setLoading(false);
	}, [type, options?.postsPerPage, options?.paged]);

	useEffect(() => {
		load();
	}, [load]);

	const create = useCallback(
		async (data: Partial<BookableEntity>) => {
			const result = await createBookable({ ...data, type });
			if (result.data) {
				await load();
			}
			return result;
		},
		[type, load]
	);

	const update = useCallback(
		async (id: number, data: Partial<BookableEntity>) => {
			const result = await updateBookable(id, data);
			if (result.data) {
				await load();
			}
			return result;
		},
		[load]
	);

	const remove = useCallback(
		async (id: number) => {
			const result = await deleteBookable(id);
			if (result.data) {
				await load();
			}
			return result;
		},
		[load]
	);

	return {
		entities,
		loading,
		totalItems,
		totalPages,
		reload: load,
		create,
		update,
		remove,
	};
}
