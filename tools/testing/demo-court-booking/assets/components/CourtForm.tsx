/**
 * Court create/edit form component
 *
 * Form for creating or editing a court entity with type-specific fields.
 */
import { useState } from 'react';
import {
	Button,
	Card,
	CardHeader,
	CardBody,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl, // @ts-expect-error — __experimentalNumberControl exists but not in types
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createCourt, updateCourt, type Court } from '../api';
import VariantMatrix from './VariantMatrix';

type Props = {
	court?: Court;
	onSaved: () => void;
	onCancel: () => void;
};

const SURFACE_OPTIONS = [
	{ label: 'Hard', value: 'hard' },
	{ label: 'Clay', value: 'clay' },
	{ label: 'Grass', value: 'grass' },
	{ label: 'Artificial', value: 'artificial' },
];

export default function CourtForm({ court, onSaved, onCancel }: Props) {
	const isEditing = !!court;

	const [name, setName] = useState(court?.name || '');
	const [description, setDescription] = useState(court?.description || '');
	const [surfaceType, setSurfaceType] = useState(
		String(court?.surfaceType || court?.meta?.surface_type || 'hard')
	);
	const [indoor, setIndoor] = useState(
		Boolean(court?.indoor ?? court?.meta?.indoor ?? false)
	);
	const [lighting, setLighting] = useState(
		Boolean(court?.lighting ?? court?.meta?.lighting ?? false)
	);
	const [maxPlayers, setMaxPlayers] = useState(
		Number(court?.maxPlayers ?? court?.meta?.max_players ?? 4)
	);
	const [duration, setDuration] = useState(Number(court?.duration || 3600));
	const [active, setActive] = useState(court?.active ?? true);
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);

		const data = {
			name,
			description,
			surface_type: surfaceType,
			indoor,
			lighting,
			max_players: maxPlayers,
			duration,
			active,
		};

		if (isEditing && court) {
			await updateCourt(court.id, data);
		} else {
			await createCourt(data);
		}

		setSaving(false);
		onSaved();
	};

	return (
		<Card>
			<CardHeader>
				<h2 style={{ margin: 0 }}>
					{isEditing
						? __('Edit Court', 'demo-court-booking')
						: __('Add Court', 'demo-court-booking')}
				</h2>
				<Button variant="tertiary" onClick={onCancel}>
					{__('Back to List', 'demo-court-booking')}
				</Button>
			</CardHeader>
			<CardBody>
				<form onSubmit={handleSubmit}>
					<TextControl
						label={__('Name', 'demo-court-booking')}
						value={name}
						onChange={setName}
						required
						__nextHasNoMarginBottom
					/>
					<TextareaControl
						label={__('Description', 'demo-court-booking')}
						value={description}
						onChange={setDescription}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={__('Surface Type', 'demo-court-booking')}
						value={surfaceType}
						options={SURFACE_OPTIONS}
						onChange={setSurfaceType}
						__nextHasNoMarginBottom
					/>
					<div
						style={{
							display: 'flex',
							gap: '24px',
							margin: '16px 0',
						}}
					>
						<ToggleControl
							label={__('Indoor', 'demo-court-booking')}
							checked={indoor}
							onChange={setIndoor}
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={__('Lighting', 'demo-court-booking')}
							checked={lighting}
							onChange={setLighting}
							__nextHasNoMarginBottom
						/>
						<ToggleControl
							label={__('Active', 'demo-court-booking')}
							checked={active}
							onChange={setActive}
							__nextHasNoMarginBottom
						/>
					</div>
					<div style={{ display: 'flex', gap: '16px' }}>
						<NumberControl
							label={__('Max Players', 'demo-court-booking')}
							value={maxPlayers}
							onChange={(val: string) =>
								setMaxPlayers(parseInt(val, 10) || 4)
							}
							min={1}
							max={20}
						/>
						<NumberControl
							label={__(
								'Duration (seconds)',
								'demo-court-booking'
							)}
							value={duration}
							onChange={(val: string) =>
								setDuration(parseInt(val, 10) || 3600)
							}
							min={900}
							step={900}
						/>
					</div>
					<div
						style={{
							marginTop: '16px',
							display: 'flex',
							gap: '8px',
						}}
					>
						<Button
							variant="primary"
							type="submit"
							isBusy={saving}
							disabled={saving || !name}
						>
							{isEditing
								? __('Update Court', 'demo-court-booking')
								: __('Create Court', 'demo-court-booking')}
						</Button>
						<Button variant="tertiary" onClick={onCancel}>
							{__('Cancel', 'demo-court-booking')}
						</Button>
					</div>
				</form>
			</CardBody>
			{isEditing && court && (
				<CardBody>
					<VariantMatrix entityId={court.id} />
				</CardBody>
			)}
		</Card>
	);
}
