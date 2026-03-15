import { useState } from 'react';
import { Button, Card, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, edit, trash, update, plus } from '@wordpress/icons';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Entity } from '~/backend/types';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import { Action } from '~/backend/admin/components/DataViews/types';
import EntityCreate from '~/backend/admin/components/EntityCreate/EntityCreate';
import DeleteModal from '~/backend/admin/components/Modals/DeleteModal/DeleteModal';
import TableFullEmpty from '~/backend/admin/components/TableFullEmpty/TableFullEmpty';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import { useStateContext } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import { entitiesApi } from '~/backend/api/entities';
import { COLORS as colors } from '~/backend/constants';
import globalStyles from 'global.module.css';

type Fields = {
	paged: number;
	number: number;
};

type View = {
	type: 'table';
	layout: object;
	hiddenFields: [];
	perPage: number;
	page: number;
};

function EntitiesTable() {
	const { openSlideOut } = useSlideout({ id: 'entity' });
	const [entityModal, setEntityModal] = useState<{ id: number } | null>(null);
	const { invalidate, getSelector } = useStateContext();
	const { deleteEntity, updateEntity } = entitiesApi({
		invalidateCache: invalidate,
	});
	const [filters, setFilters] = useState<Fields>({ paged: 1, number: 10 });

	const { entities, totalItems, totalPages, currentPage } = useSelect(() => {
		return select(store).getEntities({
			...filters,
			version: getSelector('getEntities'),
		});
	}, [filters, getSelector('getEntities')]);

	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: 10,
		page: currentPage,
	});

	const addEntity = () => {
		openSlideOut({ id: 'entity', data: { mode: 'create' } });
	};

	const editEntity = (row: Entity) => {
		openSlideOut({
			id: 'entity',
			data: { selectedEntity: row, mode: 'edit' },
		});
	};

	const addChildEntity = (row: Entity) => {
		openSlideOut({
			id: 'entity',
			data: { mode: 'create', parentId: row.id },
		});
	};

	if (!entities || entities.length === 0) {
		return (
			<TableFullEmpty>
				<p>{__('You have no entities yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addEntity}>
					{__('Create New Entity', 'wpappointments')}
				</Button>
			</TableFullEmpty>
		);
	}

	const fields = [
		{
			id: 'name',
			header: __('Name', 'wpappointments'),
			render: ({ item }: { item: Entity }) => (
				<strong>{item.name}</strong>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'type',
			header: __('Type', 'wpappointments'),
			render: ({ item }: { item: Entity }) => (
				<span>{item.type || '—'}</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'capacity',
			header: __('Capacity', 'wpappointments'),
			render: ({ item }: { item: Entity }) => (
				<span>{item.capacity ?? 1}</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'scheduleMode',
			header: __('Schedule', 'wpappointments'),
			render: ({ item }: { item: Entity }) => (
				<span>
					{item.scheduleMode === 'own'
						? __('Own', 'wpappointments')
						: __('Inherited', 'wpappointments')}
				</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'active',
			header: __('Status', 'wpappointments'),
			render: ({ item }: { item: Entity }) => (
				<span
					style={{
						color: item.active ? colors.green : colors.gray,
						fontWeight: 600,
					}}
				>
					{item.active
						? __('Active', 'wpappointments')
						: __('Inactive', 'wpappointments')}
				</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];

	const toggleEntityActive = async (item: Entity) => {
		if (item.id) {
			await updateEntity({
				id: item.id,
				name: item.name,
				parentId: item.parentId,
				active: !item.active,
				description: item.description,
				type: item.type,
				capacity: item.capacity,
				image: item.image,
				scheduleId: item.scheduleId,
				scheduleMode: item.scheduleMode,
				bufferBefore: item.bufferBefore,
				bufferAfter: item.bufferAfter,
				minLeadTime: item.minLeadTime,
				maxLeadTime: item.maxLeadTime,
				sortOrder: item.sortOrder,
			});
		}
	};

	const actions: Action[] = [
		{
			id: 'add-child',
			icon: <Icon icon={plus} color={colors.blue} />,
			isPrimary: true,
			label: __('Add child entity', 'wpappointments'),
			callback: (item: Entity) => addChildEntity(item),
		},
		{
			id: 'toggle-active',
			icon: <Icon icon={update} color={colors.gray} />,
			isPrimary: true,
			label: __('Toggle active/inactive', 'wpappointments'),
			callback: (item: Entity) => toggleEntityActive(item),
		},
		{
			id: 'edit',
			icon: <Icon icon={edit} color={colors.blue} />,
			isPrimary: true,
			label: __('Edit entity', 'wpappointments'),
			callback: (item: Entity) => editEntity(item),
		},
		{
			id: 'delete',
			icon: <Icon icon={trash} color={colors.red} />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete entity', 'wpappointments'),
			callback: (item: Entity) => {
				if (item.id) {
					setEntityModal({ id: item.id });
				}
			},
		},
	];

	return (
		<>
			<DataViews
				view={view}
				onChangeView={(currentState: View) => {
					setView(currentState);
					setFilters({
						paged: currentState.page,
						number: currentState.perPage,
					});

					invalidate('getEntities');
				}}
				fields={fields}
				actions={actions}
				data={entities}
				paginationInfo={{
					totalItems,
					totalPages,
				}}
			/>
			{entityModal && (
				<DeleteModal
					title={__('Delete Entity', 'wpappointments')}
					message={__(
						'Are you sure you want to delete this entity? Child entities will be reassigned to the parent.',
						'wpappointments'
					)}
					onConfirmClick={async () => {
						await deleteEntity(entityModal.id);
						setEntityModal(null);
					}}
					closeModal={() => setEntityModal(null)}
				/>
			)}
		</>
	);
}

export default function Entities() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();

	return (
		<StateContextProvider>
			<LayoutDefault title="Entities">
				<Card className={globalStyles.card}>
					<CardHeader>
						<Text size="title">
							{__('All Entities', 'wpappointments')}
						</Text>
						<Button
							variant="primary"
							onClick={() =>
								openSlideOut({
									id: 'entity',
									data: { mode: 'create' },
								})
							}
						>
							{__('Create New Entity', 'wpappointments')}
						</Button>
					</CardHeader>
					<CardBody>
						<EntitiesTable />
					</CardBody>
				</Card>
				{isSlideoutOpen('entity') && <EntityCreate />}
			</LayoutDefault>
		</StateContextProvider>
	);
}
