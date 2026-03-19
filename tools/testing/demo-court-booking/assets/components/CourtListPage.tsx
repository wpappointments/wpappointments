/**
 * Court list page component
 *
 * Main admin page for managing courts. Shows a table of all court entities
 * with type-specific fields and actions.
 */
import { useState, useEffect, useCallback } from 'react';
import {
	Button,
	Card,
	CardHeader,
	CardBody,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { fetchCourts, deleteCourt, type Court } from '../api';
import CourtForm from './CourtForm';
import CourtTable from './CourtTable';

export default function CourtListPage() {
	const [courts, setCourts] = useState<Court[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingCourt, setEditingCourt] = useState<Court | null>(null);
	const [showCreate, setShowCreate] = useState(false);

	const loadCourts = useCallback(async () => {
		setLoading(true);
		const data = await fetchCourts();
		setCourts(data);
		setLoading(false);
	}, []);

	useEffect(() => {
		loadCourts();
	}, [loadCourts]);

	const handleDelete = useCallback(
		async (id: number) => {
			await deleteCourt(id);
			await loadCourts();
		},
		[loadCourts]
	);

	const handleSaved = useCallback(() => {
		setEditingCourt(null);
		setShowCreate(false);
		loadCourts();
	}, [loadCourts]);

	if (editingCourt || showCreate) {
		return (
			<div style={{ padding: '20px' }}>
				<CourtForm
					court={editingCourt || undefined}
					onSaved={handleSaved}
					onCancel={() => {
						setEditingCourt(null);
						setShowCreate(false);
					}}
				/>
			</div>
		);
	}

	return (
		<div style={{ padding: '20px' }}>
			<Card>
				<CardHeader>
					<h2 style={{ margin: 0 }}>
						{__('Courts', 'demo-court-booking')}
					</h2>
					<Button
						variant="primary"
						onClick={() => setShowCreate(true)}
					>
						{__('Add Court', 'demo-court-booking')}
					</Button>
				</CardHeader>
				<CardBody>
					{loading ? (
						<Spinner />
					) : (
						<CourtTable
							courts={courts}
							onEdit={setEditingCourt}
							onDelete={handleDelete}
						/>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
