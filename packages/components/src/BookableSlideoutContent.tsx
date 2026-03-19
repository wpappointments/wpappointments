/**
 * Bookable slideout content wrapper
 *
 * Determines whether to render the default form or a custom
 * editComponent, fetches type info, and provides the onSave/onCancel
 * contract to whichever form component is used.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import { useState, useEffect } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	useSlideout,
	displaySuccessToast,
	displayErrorToast,
	fetchBookableTypes,
	createBookable,
	updateBookable,
	getBookableType,
} from '@wpappointments/data';
import type { BookableEntity, BookableTypeInfo } from '@wpappointments/data';
import BookableDefaultForm from './BookableDefaultForm';

type BookableSlideoutContentProps = {
	entity: BookableEntity | null;
	type: string;
	slideoutId: string;
	onAfterSave?: () => void;
};

export default function BookableSlideoutContent({
	entity,
	type,
	slideoutId,
	onAfterSave,
}: BookableSlideoutContentProps) {
	const [typeInfo, setTypeInfo] = useState<BookableTypeInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const { closeSlideOut } = useSlideout();

	useEffect(() => {
		let cancelled = false;

		async function loadTypeInfo() {
			const result = await fetchBookableTypes();

			if (cancelled) return;

			if (result.data) {
				const info = result.data.find((t) => t.slug === type);
				setTypeInfo(info ?? null);
			}

			setLoading(false);
		}

		loadTypeInfo();

		return () => {
			cancelled = true;
		};
	}, [type]);

	const onSave = async (data: Record<string, unknown>) => {
		const payload = { ...data, type };

		if (entity) {
			const result = await updateBookable(entity.id, payload);

			if (result.error) {
				displayErrorToast(
					__('Something went wrong while updating.', 'wpappointments')
				);
				return;
			}

			displaySuccessToast(__('Updated successfully.', 'wpappointments'));
		} else {
			const result = await createBookable(payload);

			if (result.error) {
				displayErrorToast(
					__('Something went wrong while creating.', 'wpappointments')
				);
				return;
			}

			displaySuccessToast(__('Created successfully.', 'wpappointments'));
		}

		closeSlideOut(slideoutId);
		onAfterSave?.();
	};

	const onCancel = () => {
		closeSlideOut(slideoutId);
	};

	if (loading) {
		return (
			<div style={{ padding: '16px', textAlign: 'center' }}>
				{/* @ts-expect-error -- WP Spinner component types issue */}
				<Spinner />
			</div>
		);
	}

	if (!typeInfo) {
		return (
			<div style={{ padding: '16px' }}>
				<p>
					{__('Could not load type information.', 'wpappointments')}
				</p>
			</div>
		);
	}

	// Check for custom editComponent (Tier 2).
	const registration = getBookableType(type);
	const EditComponent = registration?.editComponent;

	if (EditComponent) {
		return (
			<EditComponent
				entity={entity}
				typeInfo={typeInfo}
				onSave={onSave}
				onCancel={onCancel}
			/>
		);
	}

	// Default form (Tier 1).
	return (
		<BookableDefaultForm
			entity={entity}
			typeInfo={typeInfo}
			onSave={onSave}
			onCancel={onCancel}
		/>
	);
}
