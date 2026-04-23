import { useState, useEffect, useCallback } from 'react';
import {
	fetchVariants,
	createVariant,
	updateVariant,
	deleteVariant,
	generateVariants,
} from '../api';
import type { BookableVariant } from '../types';

export function useBookableVariants(entityId: number) {
	const [variants, setVariants] = useState<BookableVariant[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!entityId) {
			setVariants([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		const result = await fetchVariants(entityId);

		if (result.data) {
			setVariants(result.data.variants);
		}
		setLoading(false);
	}, [entityId]);

	useEffect(() => {
		load();
	}, [load]);

	const create = useCallback(
		async (data: Partial<BookableVariant>) => {
			const result = await createVariant(entityId, data);
			if (result.data) {
				await load();
			}
			return result;
		},
		[entityId, load]
	);

	const update = useCallback(
		async (variantId: number, data: Partial<BookableVariant>) => {
			const result = await updateVariant(entityId, variantId, data);
			if (result.data) {
				await load();
			}
			return result;
		},
		[entityId, load]
	);

	const remove = useCallback(
		async (variantId: number) => {
			const result = await deleteVariant(entityId, variantId);
			if (result.data) {
				await load();
			}
			return result;
		},
		[entityId, load]
	);

	const generate = useCallback(async () => {
		const result = await generateVariants(entityId);
		if (result.data) {
			await load();
		}
		return result;
	}, [entityId, load]);

	return {
		variants,
		loading,
		reload: load,
		create,
		update,
		remove,
		generate,
	};
}
