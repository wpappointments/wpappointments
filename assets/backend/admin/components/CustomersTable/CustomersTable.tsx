import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, info, edit, trash } from '@wordpress/icons';
import { formatDate } from '~/backend/utils/i18n';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Customer } from '~/backend/types';
import { Action } from '../DataViews/types';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import DeleteCustomerModal from '~/backend/admin/components/Modals/DeleteModal/DeleteModal';
import Empty from '~/backend/admin/components/TableFull/Empty/Empty';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { customersApi } from '~/backend/api/customers';
import { COLORS as colors } from '~/backend/constants';


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

type CustomerDetailsModalsProps = {
	deleteAppointment: () => Promise<void>;
	closeModal: () => void;
};

export function CustomerDetailsModals({
	deleteAppointment,
	closeModal,
}: CustomerDetailsModalsProps) {
	return (
		<DeleteCustomerModal
			title={__('Delete Customer', 'wpappointments')}
			message={__(
				'Are you sure you want to delete this customer? This action cannot be undone.',
				'wpappointments'
			)}
			onConfirmClick={deleteAppointment}
			closeModal={closeModal}
		/>
	);
}

export default function CustomersTable() {
	const { openSlideOut } = useSlideout({
		id: 'customer',
	});
	const [customerModal, setCustomerModal] = useState<{
		id: number;
	} | null>(null);
	const { invalidate, getSelector } = useStateContext();
	const { deleteCustomer } = customersApi({
		invalidateCache: invalidate,
	});
	const [filters, setFilters] = useState<Fields>({
		paged: 1,
		number: 10,
	});
	const { customers, totalItems, totalPages, currentPage } = useSelect(() => {
		return select(store).getCustomers({
			...filters,
			version: getSelector('getCustomers'),
		});
	}, [filters, getSelector('getCustomers')]);

	const [view, setView] = useState<View>({
		type: 'table',
		layout: {},
		hiddenFields: [],
		perPage: 10,
		page: currentPage,
	});

	const addCustomer = () => {
		openSlideOut({
			id: 'customer',
			data: {
				mode: 'create',
				screen: 'customers',
			},
		});
	};

	const editCustomer = (row: Customer) => {
		openSlideOut({
			id: 'customer',
			data: {
				selectedCustomer: row,
				mode: 'edit',
			},
		});
	};

	const viewCustomer = (row: Customer) => {
		openSlideOut({
			id: 'view-customer',
			data: {
				id: row.id,
			},
		});
	};

	if (!customers || customers.length === 0) {
		return (
			<Empty>
				<p>{__('You have no customers yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addCustomer}>
					{__('Create New Customer', 'wpappointments')}
				</Button>
			</Empty>
		);
	}

	const fields = [
		{
			id: 'name',
			header: __('Name', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return (
					<>
						<Button
							variant="link"
							onClick={() => {
								viewCustomer && viewCustomer(item);
							}}
							style={{ marginBottom: '5px' }}
						>
							<strong>{item.name}</strong>
						</Button>
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'email',
			header: __('Email', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return <a href={`mailto:${item.email}`}>{item.email}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'phone',
			header: __('Phone', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return <a href={`tel:${item.phone}`}>{item.phone}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'created',
			header: __('Created', 'wpappointments'),
			render: ({ item }: { item: Customer }) => {
				return (
					<>
						{item.created
							? formatDate(item.created)
							: __('Missing date information', 'wpappointments')}
					</>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const actions: Action[] = [
		{
			id: 'view',
			icon: <Icon icon={info} color={colors.blue} />,
			isPrimary: true,
			label: __('View customer details', 'wpappointments'),
			callback: (item: Customer) => {
				viewCustomer && viewCustomer(item);
			},
		},
		{
			id: 'edit',
			icon: <Icon icon={edit} color={colors.blue} />,
			isPrimary: true,
			label: __('Edit customer details', 'wpappointments'),
			callback: (item: Customer) => {
				editCustomer && editCustomer(item);
			},
		},
		{
			id: 'delete',
			icon: <Icon icon={trash} color={colors.red} />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete customer', 'wpappointments'),
			callback: (item: Customer) => {
				const { id } = item;
				setCustomerModal({ id });
			},
		},
	];

	const paginationInfo = {
		totalItems: totalItems,
		totalPages: totalPages,
	};

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

					invalidate('getCustomers');
				}}
				fields={fields}
				actions={actions}
				data={customers}
				paginationInfo={paginationInfo}
			/>
			{customerModal && (
				<CustomerDetailsModals
					deleteAppointment={async () => {
						if (!deleteCustomer) {
							return;
						}

						await deleteCustomer(customerModal.id);
						setCustomerModal(null);
					}}
					closeModal={() => {
						setCustomerModal(null);
					}}
				/>
			)}
		</>
	);
}
