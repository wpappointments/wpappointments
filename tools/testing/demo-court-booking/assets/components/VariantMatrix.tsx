/**
 * Variant matrix display component
 *
 * Shows variants for a court entity with their attribute values
 * and overridden fields.
 */
import { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { fetchVariants, type CourtVariant } from '../api';

type Props = {
	entityId: number;
};

export default function VariantMatrix({ entityId }: Props) {
	const [variants, setVariants] = useState<CourtVariant[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		const data = await fetchVariants(entityId);
		setVariants(data);
		setLoading(false);
	}, [entityId]);

	useEffect(() => {
		load();
	}, [load]);

	if (loading) return <Spinner />;

	if (variants.length === 0) {
		return <p>{__('No variants found.', 'demo-court-booking')}</p>;
	}

	if (
		variants.length === 1 &&
		Object.keys(variants[0].attributeValues).length === 0
	) {
		return (
			<p style={{ color: '#757575' }}>
				{__(
					'Simple court — single implicit variant.',
					'demo-court-booking'
				)}
			</p>
		);
	}

	return (
		<div>
			<h3>{__('Variants', 'demo-court-booking')}</h3>
			<table className="wp-list-table widefat fixed striped">
				<thead>
					<tr>
						<th>{__('Variant', 'demo-court-booking')}</th>
						<th>{__('Attributes', 'demo-court-booking')}</th>
						<th>{__('Duration', 'demo-court-booking')}</th>
						<th>{__('Overrides', 'demo-court-booking')}</th>
						<th>{__('Status', 'demo-court-booking')}</th>
					</tr>
				</thead>
				<tbody>
					{variants.map((variant) => (
						<tr key={variant.id}>
							<td>
								<strong>{variant.name}</strong>
							</td>
							<td>
								{Object.entries(variant.attributeValues).map(
									([key, value]) => (
										<span
											key={key}
											style={{
												display: 'inline-block',
												background: '#f0f0f0',
												padding: '2px 8px',
												borderRadius: '3px',
												marginRight: '4px',
												fontSize: '12px',
											}}
										>
											{key}: {value}
										</span>
									)
								)}
							</td>
							<td>
								{variant.duration
									? `${Math.round(variant.duration / 60)} min`
									: '—'}
							</td>
							<td>
								{variant.overrides.length > 0
									? variant.overrides.join(', ')
									: __('None', 'demo-court-booking')}
							</td>
							<td>
								<span
									style={{
										color: variant.active
											? 'green'
											: 'gray',
									}}
								>
									{variant.active
										? __('Active', 'demo-court-booking')
										: __('Inactive', 'demo-court-booking')}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
