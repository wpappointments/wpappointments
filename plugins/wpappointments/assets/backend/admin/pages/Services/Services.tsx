import { useState } from 'react';
import { Button, Card, CardHeader } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info, edit, trash } from '@wordpress/icons';
import { Text } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Service } from '~/backend/types';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import { Action } from '~/backend/admin/components/DataViews/types';
import DeleteModal from '~/backend/admin/components/Modals/DeleteModal/DeleteModal';
import ServiceCreate from '~/backend/admin/components/ServiceCreate/ServiceCreate';
import TableFullEmpty from '~/backend/admin/components/TableFullEmpty/TableFullEmpty';
import { StateContextProvider } from '~/backend/admin/context/StateContext';
import { useStateContext } from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';
import { servicesApi } from '~/backend/api/services';
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

function ServicesTable() {
	const { openSlideOut } = useSlideout({ id: 'service' });
	const [serviceModal, setServiceModal] = useState<{ id: number } | null>(
		null
	);
	const { invalidate, getSelector } = useStateContext();
	const { deleteService } = servicesApi({ invalidateCache: invalidate });
	const [filters, setFilters] = useState<Fields>({ paged: 1, number: 10 });

	const { services, totalItems, totalPages, currentPage } = useSelect(() => {
		return select(store).getServices({
			...filters,
			version: getSelector('getServices'),
		});
	}, [filters, getSelector('getServices')]);

	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: 10,
		page: currentPage,
	});

	const addService = () => {
		openSlideOut({ id: 'service', data: { mode: 'create' } });
	};

	const editService = (row: Service) => {
		openSlideOut({
			id: 'service',
			data: { selectedService: row, mode: 'edit' },
		});
	};

	if (!services || services.length === 0) {
		return (
			<TableFullEmpty>
				<p>{__('You have no services yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addService}>
					{__('Create New Service', 'wpappointments')}
				</Button>
			</TableFullEmpty>
		);
	}

	const fields = [
		{
			id: 'name',
			header: __('Name', 'wpappointments'),
			render: ({ item }: { item: Service }) => (
				<strong>{item.name}</strong>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'duration',
			header: __('Duration (min)', 'wpappointments'),
			render: ({ item }: { item: Service }) => (
				<span>{item.duration ?? '—'}</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'active',
			header: __('Status', 'wpappointments'),
			render: ({ item }: { item: Service }) => (
				<span>
					{item.active
						? __('Active', 'wpappointments')
						: __('Inactive', 'wpappointments')}
				</span>
			),
			enableSorting: false,
			enableHiding: false,
		},
	];

	const actions: Action[] = [
		{
			id: 'view',
			icon: <Icon icon={info} color={colors.blue} />,
			isPrimary: true,
			label: __('View service details', 'wpappointments'),
			callback: (item: Service) => editService(item),
		},
		{
			id: 'edit',
			icon: <Icon icon={edit} color={colors.blue} />,
			isPrimary: true,
			label: __('Edit service', 'wpappointments'),
			callback: (item: Service) => editService(item),
		},
		{
			id: 'delete',
			icon: <Icon icon={trash} color={colors.red} />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete service', 'wpappointments'),
			callback: (item: Service) => {
				if (item.id) {
					setServiceModal({ id: item.id });
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

					invalidate('getServices');
				}}
				fields={fields}
				actions={actions}
				data={services}
				paginationInfo={{
					totalItems,
					totalPages,
				}}
			/>
			{serviceModal && (
				<DeleteModal
					title={__('Delete Service', 'wpappointments')}
					message={__(
						'Are you sure you want to delete this service? This action cannot be undone.',
						'wpappointments'
					)}
					onConfirmClick={async () => {
						await deleteService(serviceModal.id);
						setServiceModal(null);
					}}
					closeModal={() => setServiceModal(null)}
				/>
			)}
		</>
	);
}

export default function Services() {
	const { openSlideOut, isSlideoutOpen } = useSlideout();

	return (
		<StateContextProvider>
			<LayoutDefault title="Services">
				<Card className={globalStyles.card}>
					<CardHeader>
						<Text size="title">
							{__('All Services', 'wpappointments')}
						</Text>
						<Button
							variant="primary"
							onClick={() =>
								openSlideOut({
									id: 'service',
									data: { mode: 'create' },
								})
							}
						>
							{__('Create New Service', 'wpappointments')}
						</Button>
					</CardHeader>
					<CardBody>
						<ServicesTable />
					</CardBody>
				</Card>
				{isSlideoutOpen('service') && <ServiceCreate />}
			</LayoutDefault>
		</StateContextProvider>
	);
}
