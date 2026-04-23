import { useState, useEffect, useCallback } from 'react';
import { fetchVariantAvailability } from '../api';
import type { AvailabilityData } from '../types';

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
