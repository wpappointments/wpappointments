import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
// @ts-ignore
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { formatDate } from '~/backend/utils/i18n';
import useSlideout from '~/backend/hooks/useSlideout';
import { Customer } from '~/backend/store/customers/customers.types';
import { store } from '~/backend/store/store';
import { Delete, Edit, Info } from '~/backend/admin/components/Icons/Icons';
import Empty from '~/backend/admin/components/TableFull/Empty/Empty';
import DeleteModal from '~/backend/admin/components/modals/Delete/Delete';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { customersApi } from '~/backend/api/customers';


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
		<DeleteModal
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
			},
		});
	};

	const editCustomer = (row: Customer) => {
		openSlideOut({
			id: 'customer',
			data: {
				selectedCustomer: row.id,
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
				return <>{formatDate(item.created)}</>;
			},
			enableSorting: false,
			enableHiding: false,
		},
	];

	const actions = [
		{
			id: 'view',
			icon: () => <Info />,
			isPrimary: true,
			label: __('View appointment details', 'wpappointments'),
			callback: ([item]: [Customer]) => {
				viewCustomer && viewCustomer(item);
			},
		},
		{
			id: 'edit',
			icon: () => <Edit />,
			isPrimary: true,
			label: __('Edit appointment details', 'wpappointments'),
			callback: ([item]: [Customer]) => {
				editCustomer && editCustomer(item);
			},
		},
		{
			id: 'delete',
			icon: () => <Delete />,
			isPrimary: true,
			isDestructive: true,
			label: __('Delete appointment', 'wpappointments'),
			callback: ([item]: [Customer]) => {
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
				search={false}
				supportedLayouts="table"
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
