/**
 * Bookable React hooks
 *
 * Shared hooks for fetching and managing bookable entities, variants,
 * and availability. Plugins building bookable type UIs use these hooks
 * in their React components.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import { useState, useEffect, useCallback } from 'react';
import {
	fetchBookables,
	fetchBookable,
	createBookable,
	updateBookable,
	deleteBookable,
	fetchVariants,
	createVariant,
	updateVariant,
	deleteVariant,
	generateVariants,
	fetchVariantAvailability,
} from './api';
import type {
	BookableEntity,
	BookableVariant,
	AvailabilityData,
} from './types';

/**
 * Hook to fetch and manage bookable entities of a specific type
 *
 * @param type - Bookable type slug to filter by
 * @param options - Additional query options
 * @returns Bookable entities, loading state, and CRUD operations
 */
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

/**
 * Hook to fetch and manage variants for a bookable entity
 *
 * @param entityId - Parent bookable entity ID
 * @returns Variants, loading state, and CRUD operations
 */
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

/**
 * Hook to fetch effective availability for a variant
 *
 * @param variantId - Bookable variant ID
 * @param dateRange - Optional date range filter
 * @returns Availability data and loading state
 */
export function useEffectiveAvailability(
	variantId: number,
	dateRange?: { startDate?: string; endDate?: string }
) {
	const [availability, setAvailability] = useState<AvailabilityData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		if (!variantId) {
			setAvailability(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		const result = await fetchVariantAvailability(variantId, dateRange);

		if (result.data) {
			setAvailability(result.data);
		}
		setLoading(false);
	}, [variantId, dateRange?.startDate, dateRange?.endDate]);

	useEffect(() => {
		load();
	}, [load]);

	return {
		availability,
		loading,
		reload: load,
	};
}

/**
 * Hook to fetch a single bookable entity by ID
 *
 * @param id - Bookable entity ID
 * @returns Entity data and loading state
 */
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
