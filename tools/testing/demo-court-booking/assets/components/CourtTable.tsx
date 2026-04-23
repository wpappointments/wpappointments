/**
 * Court table component
 *
 * Displays courts in a table with type-specific fields and actions.
 */
import { useState, useEffect } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { fetchVariants, type Court } from '../api';

type Props = {
	courts: Court[];
	onEdit: (court: Court) => void;
	onDelete: (id: number) => void;
};

function VariantCount({ entityId }: { entityId: number }) {
	const [count, setCount] = useState<number | null>(null);

	useEffect(() => {
		fetchVariants(entityId).then((variants) => setCount(variants.length));
	}, [entityId]);

	if (count === null) return <span>...</span>;
	return <span>{count}</span>;
}

export default function CourtTable({ courts, onEdit, onDelete }: Props) {
	if (courts.length === 0) {
		return <p>{__('No courts found.', 'demo-court-booking')}</p>;
	}

	return (
		<table className="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th>{__('Name', 'demo-court-booking')}</th>
					<th>{__('Surface', 'demo-court-booking')}</th>
					<th>{__('Indoor', 'demo-court-booking')}</th>
					<th>{__('Lighting', 'demo-court-booking')}</th>
					<th>{__('Max Players', 'demo-court-booking')}</th>
					<th>{__('Variants', 'demo-court-booking')}</th>
					<th>{__('Status', 'demo-court-booking')}</th>
					<th>{__('Actions', 'demo-court-booking')}</th>
				</tr>
			</thead>
			<tbody>
				{courts.map((court) => (
					<tr key={court.id}>
						<td>
							<strong>{court.name}</strong>
						</td>
						<td>
							{String(
								court.surfaceType ||
									court.meta?.surface_type ||
									'—'
							)}
						</td>
						<td>
							{(court.indoor ?? court.meta?.indoor)
								? __('Yes', 'demo-court-booking')
								: __('No', 'demo-court-booking')}
						</td>
						<td>
							{(court.lighting ?? court.meta?.lighting)
								? __('Yes', 'demo-court-booking')
								: __('No', 'demo-court-booking')}
						</td>
						<td>
							{String(
								court.maxPlayers ??
									court.meta?.max_players ??
									'—'
							)}
						</td>
						<td>
							<VariantCount entityId={court.id} />
						</td>
						<td>
							<span
								style={{
									color: court.active ? 'green' : 'gray',
								}}
							>
								{court.active
									? __('Active', 'demo-court-booking')
									: __('Inactive', 'demo-court-booking')}
							</span>
						</td>
						<td>
							<Button
								variant="link"
								onClick={() => onEdit(court)}
							>
								{__('Edit', 'demo-court-booking')}
							</Button>
							{' | '}
							<Button
								variant="link"
								isDestructive
								onClick={() => {
									if (
										window.confirm(
											__(
												'Delete this court?',
												'demo-court-booking'
											)
										)
									) {
										onDelete(court.id);
									}
								}}
							>
								{__('Delete', 'demo-court-booking')}
							</Button>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
