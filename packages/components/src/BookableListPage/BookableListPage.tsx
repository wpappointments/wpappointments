/**
 * Generic bookable list page component
 *
 * Renders a complete list page for a bookable type using the core UI
 * components (LayoutDefault, Card, DataViews). Plugins that register
 * columns via registerBookableType() get this page automatically
 * without needing to provide a listComponent.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import { useState, useEffect, useCallback } from 'react';
import { Button, Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { edit, trash } from '@wordpress/icons';
import {
	useSlideout,
	fetchBookables,
	deleteBookable,
} from '@wpappointments/data';
import type { BookableEntity, BookableTypeColumn } from '@wpappointments/data';
import BookableSlideoutContent from '../BookableSlideoutContent/BookableSlideoutContent';
import { DataViews } from '../DataViews/DataViews';
import type { Action, Field, View } from '../DataViews/DataViews';
import DeleteModal from '../DeleteModal/DeleteModal';
import { HeaderActionsFill } from '../SlotFill/HeaderActions';
import TableFullEmpty from '../TableFullEmpty/TableFullEmpty';

type BookableListPageProps = {
	/** Bookable type slug */
	type: string;
	/** Display label for the type */
	label: string;
	/** Column definitions from type registration */
	columns?: BookableTypeColumn[];
};

const COLORS = {
	green: '#00a32a',
	red: '#cc1818',
};

const defaultView: View = {
	type: 'table',
	search: '',
	filters: [],
	page: 1,
	perPage: 10,
	layout: {},
};

export default function BookableListPage({
	type,
	label,
	columns,
}: BookableListPageProps) {
	const [entities, setEntities] = useState<BookableEntity[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [view, setView] = useState<View>(() => ({
		...defaultView,
		fields: (columns ?? [{ id: 'name' }, { id: 'active' }]).map(
			(c) => c.id
		),
	}));

	const createSlideoutId = `bookable-create-${type}`;
	const editSlideoutId = `bookable-edit-${type}`;

	const { openSlideOut } = useSlideout();

	/* translators: %s: bookable type label */
	const addNewLabel = sprintf(
		__('Add New %s', 'appointments-booking'),
		label
	);
	/* translators: %s: bookable type label */
	const editLabel = sprintf(__('Edit %s', 'appointments-booking'), label);

	const load = useCallback(async () => {
		setLoading(true);
		const result = await fetchBookables({
			type,
			postsPerPage: view.perPage ?? 10,
			paged: view.page ?? 1,
		});

		if (result.data) {
			setEntities(result.data.bookables);
			setTotalItems(result.data.totalItems);
			setTotalPages(result.data.totalPages);
		}
		setLoading(false);
	}, [type, view.perPage, view.page]);

	useEffect(() => {
		load();
	}, [load]);

	const handleDelete = useCallback(
		async (id: number) => {
			await deleteBookable(id);
			await load();
		},
		[load]
	);

	const handleCreate = useCallback(() => {
		openSlideOut({
			id: createSlideoutId,
			title: addNewLabel,
			content: (
				<BookableSlideoutContent
					entity={null}
					type={type}
					slideoutId={createSlideoutId}
					onAfterSave={load}
				/>
			),
		});
	}, [createSlideoutId, openSlideOut, addNewLabel, type, load]);

	const handleEdit = useCallback(
		(entity: BookableEntity) => {
			openSlideOut({
				id: editSlideoutId,
				title: editLabel,
				data: { entityId: entity.id },
				content: (
					<BookableSlideoutContent
						entity={entity}
						type={type}
						slideoutId={editSlideoutId}
						onAfterSave={load}
					/>
				),
			});
		},
		[editSlideoutId, editLabel, openSlideOut, type, load]
	);

	// Build DataViews fields from column config.
	const fields: Field<BookableEntity>[] = buildFields(columns);

	// Build actions.
	const actions: Action<BookableEntity>[] = [
		{
			id: 'edit',
			icon: edit,
			label: __('Edit', 'appointments-booking'),
			callback: (items) => {
				handleEdit(items[0]);
			},
		},
		{
			id: 'delete',
			icon: trash,
			label: __('Delete', 'appointments-booking'),
			RenderModal: ({ items, closeModal }) => {
				const entity = items[0];
				return (
					<DeleteModal
						title={__('Delete Item', 'appointments-booking')}
						message={__(
							'Are you sure you want to delete this item? This action cannot be undone.',
							'appointments-booking'
						)}
						onConfirmClick={async () => {
							if (entity.id) {
								await handleDelete(entity.id);
							}
							closeModal?.();
						}}
						closeModal={() => closeModal?.()}
					/>
				);
			},
		},
	];

	const headerActions = (
		<HeaderActionsFill>
			<Button variant="primary" onClick={handleCreate}>
				{__('Add New', 'appointments-booking')}
			</Button>
		</HeaderActionsFill>
	);

	if (loading) {
		return (
			<>
				{headerActions}
				{/* @ts-expect-error -- WP Spinner component types issue */}
				<Spinner />
			</>
		);
	}

	if (entities.length === 0) {
		return (
			<>
				{headerActions}
				<TableFullEmpty>
					<p>{__('No items found.', 'appointments-booking')}</p>
				</TableFullEmpty>
			</>
		);
	}

	return (
		<>
			{headerActions}
			<DataViews
				data={entities}
				fields={fields}
				view={view}
				onChangeView={setView}
				actions={actions}
				paginationInfo={{ totalItems, totalPages }}
				getItemId={(item: BookableEntity) => String(item.id ?? 0)}
				search={false}
				defaultLayouts={{ table: {} }}
			/>
		</>
	);
}

/**
 * Build DataViews Field definitions from BookableTypeColumn config
 */
function buildFields(columns?: BookableTypeColumn[]): Field<BookableEntity>[] {
	// Default columns if none provided.
	const defaultColumns: BookableTypeColumn[] = [
		{
			id: 'name',
			header: __('Name', 'appointments-booking'),
		},
		{
			id: 'active',
			header: __('Status', 'appointments-booking'),
			render: ({ item }) => {
				return (
					<span
						style={{
							color: item.active ? COLORS.green : COLORS.red,
						}}
					>
						{item.active
							? __('Active', 'appointments-booking')
							: __('Inactive', 'appointments-booking')}
					</span>
				);
			},
		},
	];

	const cols = columns && columns.length > 0 ? columns : defaultColumns;

	return cols.map((col) => ({
		id: col.id,
		label: col.header,
		enableSorting: false,
		enableHiding: false,
		render: col.render
			? ({ item }) => {
					const Render = col.render!;
					return <Render item={item} />;
				}
			: ({ item }) => {
					const value = col.getValue
						? col.getValue(item)
						: item[col.id];

					if (typeof value === 'boolean') {
						return (
							<>
								{value
									? __('Yes', 'appointments-booking')
									: __('No', 'appointments-booking')}
							</>
						);
					}

					return <>{String(value ?? '')}</>;
				},
	}));
}
