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
import { Button, Card, CardHeader, Spinner } from '@wordpress/components';
import { __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, edit, trash } from '@wordpress/icons';
import {
	useSlideout,
	fetchBookables,
	deleteBookable,
} from '@wpappointments/data';
import type { BookableEntity, BookableTypeColumn } from '@wpappointments/data';
import BookableSlideoutContent from './BookableSlideoutContent';
import CardBody from './CardBody/CardBody';
import { DataViews } from './DataViews/DataViews';
import type { Field, Action, View } from './DataViews/types';
import TableFullEmpty from './TableFullEmpty/TableFullEmpty';

type BookableListPageProps = {
	/** Bookable type slug */
	type: string;
	/** Display label for the type */
	label: string;
	/** Column definitions from type registration */
	columns?: BookableTypeColumn[];
	/** Optional CSS class for the card wrapper */
	className?: string;
};

const COLORS = {
	blue: '#2271b1',
	red: '#cc1818',
	green: '#00a32a',
};

export default function BookableListPage({
	type,
	label,
	columns,
	className,
}: BookableListPageProps) {
	const [entities, setEntities] = useState<BookableEntity[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: 10,
		page: 1,
	});

	const createSlideoutId = `bookable-create-${type}`;
	const editSlideoutId = `bookable-edit-${type}`;

	const { openSlideOut } = useSlideout();

	/* translators: %s: bookable type label */
	const addNewLabel = sprintf(__('Add New %s', 'wpappointments'), label);
	/* translators: %s: bookable type label */
	const editLabel = sprintf(__('Edit %s', 'wpappointments'), label);

	const load = useCallback(async () => {
		setLoading(true);
		const result = await fetchBookables({
			type,
			postsPerPage: view.perPage,
			paged: view.page,
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
	const fields: Field[] = buildFields(columns);

	// Build actions.
	const actions: Action[] = [
		{
			id: 'edit',
			icon: <Icon icon={edit} />,
			isPrimary: true,
			label: __('Edit', 'wpappointments'),
			callback: (item) => {
				handleEdit(item as BookableEntity);
			},
		},
		{
			id: 'delete',
			icon: <Icon icon={trash} />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete', 'wpappointments'),
			callback: (item) => {
				const entity = item as BookableEntity;
				if (
					entity.id &&
					// eslint-disable-next-line no-alert
					window.confirm(
						__(
							'Are you sure you want to delete this item?',
							'wpappointments'
						)
					)
				) {
					handleDelete(entity.id);
				}
			},
		},
	];

	const addNewButton = (
		<Button variant="primary" onClick={handleCreate}>
			{__('Add New', 'wpappointments')}
		</Button>
	);

	if (loading) {
		return (
			<Card className={className}>
				<CardBody>
					{/* @ts-expect-error -- WP Spinner component types issue */}
					<Spinner />
				</CardBody>
			</Card>
		);
	}

	if (entities.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<Text size="title">{label}</Text>
					{addNewButton}
				</CardHeader>
				<CardBody>
					<TableFullEmpty>
						<p>{__('No items found.', 'wpappointments')}</p>
					</TableFullEmpty>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<Text size="title">{label}</Text>
				{addNewButton}
			</CardHeader>
			<CardBody>
				<DataViews
					view={view}
					onChangeView={(newView: View) => {
						setView(newView);
					}}
					fields={fields}
					actions={actions}
					data={entities as Record<string, unknown>[]}
					paginationInfo={{ totalItems, totalPages }}
				/>
			</CardBody>
		</Card>
	);
}

/**
 * Build DataViews Field definitions from BookableTypeColumn config
 */
function buildFields(columns?: BookableTypeColumn[]): Field[] {
	// Default columns if none provided.
	const defaultColumns: BookableTypeColumn[] = [
		{
			id: 'name',
			header: __('Name', 'wpappointments'),
		},
		{
			id: 'active',
			header: __('Status', 'wpappointments'),
			render: ({ item }) => {
				const entity = item as BookableEntity;
				return (
					<span
						style={{
							color: entity.active ? COLORS.green : COLORS.red,
						}}
					>
						{entity.active
							? __('Active', 'wpappointments')
							: __('Inactive', 'wpappointments')}
					</span>
				);
			},
		},
	];

	const cols = columns && columns.length > 0 ? columns : defaultColumns;

	return cols.map((col) => ({
		id: col.id,
		header: col.header,
		enableSorting: false,
		enableHiding: false,
		render: col.render
			? ({ item }) => {
					const Render = col.render!;
					return <Render item={item as BookableEntity} />;
				}
			: ({ item }) => {
					const entity = item as BookableEntity;
					const value = col.getValue
						? col.getValue(entity)
						: entity[col.id];

					if (typeof value === 'boolean') {
						return (
							<>
								{value
									? __('Yes', 'wpappointments')
									: __('No', 'wpappointments')}
							</>
						);
					}

					return <>{String(value ?? '')}</>;
				},
	}));
}
