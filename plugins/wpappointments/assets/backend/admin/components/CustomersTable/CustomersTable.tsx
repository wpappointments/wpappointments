import { useState } from 'react';
import { Button } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { info, edit, trash } from '@wordpress/icons';
import {
	DataViews,
	DeleteModal,
	TableFullEmpty,
} from '@wpappointments/components';
import type { Action, Field, View } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { formatDate } from '~/backend/utils/i18n';
import { store } from '~/backend/store/store';
import { Customer } from '~/backend/types';
import { useStateContext } from '~/backend/admin/context/StateContext';
import { customersApi } from '~/backend/api/customers';

type Filters = {
	paged: number;
	number: number;
};

const defaultView: View = {
	type: 'table',
	search: '',
	filters: [],
	page: 1,
	perPage: 10,
	fields: ['name', 'email', 'phone', 'created'],
	layout: {},
};

export default function CustomersTable() {
	const { openSlideOut } = useSlideout({
		id: 'customer',
	});
	const { invalidate, getSelector } = useStateContext();
	const { deleteCustomer } = customersApi({
		invalidateCache: invalidate,
	});
	const [filters, setFilters] = useState<Filters>({
		paged: 1,
		number: 10,
	});
	const { customers, totalItems, totalPages } = useSelect(() => {
		return select(store).getCustomers({
			...filters,
			version: getSelector('getCustomers'),
		});
	}, [filters, getSelector('getCustomers')]);

	const [view, setView] = useState<View>(defaultView);

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

	if (!customers || totalItems === 0) {
		return (
			<TableFullEmpty>
				<p>{__('You have no customers yet', 'wpappointments')}</p>
				<Button variant="primary" onClick={addCustomer}>
					{__('Create New Customer', 'wpappointments')}
				</Button>
			</TableFullEmpty>
		);
	}

	const fields: Field<Customer>[] = [
		{
			id: 'name',
			label: __('Name', 'wpappointments'),
			render: ({ item }) => {
				return (
					<Button variant="link" onClick={() => viewCustomer(item)}>
						<strong>{item.name}</strong>
					</Button>
				);
			},
			enableSorting: false,
			enableHiding: false,
			enableGlobalSearch: false,
		},
		{
			id: 'email',
			label: __('Email', 'wpappointments'),
			render: ({ item }) => {
				return <a href={`mailto:${item.email}`}>{item.email}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'phone',
			label: __('Phone', 'wpappointments'),
			render: ({ item }) => {
				return <a href={`tel:${item.phone}`}>{item.phone}</a>;
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: 'created',
			label: __('Created', 'wpappointments'),
			render: ({ item }) => {
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

	const actions: Action<Customer>[] = [
		{
			id: 'view',
			icon: info,
			label: __('View customer details', 'wpappointments'),
			callback: (items) => {
				if (items[0]) viewCustomer(items[0]);
			},
		},
		{
			id: 'edit',
			icon: edit,
			label: __('Edit customer details', 'wpappointments'),
			callback: (items) => {
				if (items[0]) editCustomer(items[0]);
			},
		},
		{
			id: 'delete',
			icon: trash,
			label: __('Delete customer', 'wpappointments'),
			RenderModal: ({ items, closeModal: closeActionModal }) => {
				const item = items[0];
				return (
					<DeleteModal
						title={__('Delete Customer', 'wpappointments')}
						message={__(
							'Are you sure you want to delete this customer? This action cannot be undone.',
							'wpappointments'
						)}
						onConfirmClick={async () => {
							if (item.id && deleteCustomer) {
								await deleteCustomer(item.id);
							}
							closeActionModal?.();
						}}
						closeModal={() => closeActionModal?.()}
					/>
				);
			},
		},
	];

	return (
		<DataViews
			data={customers}
			fields={fields}
			view={view}
			onChangeView={(newView: View) => {
				setView(newView);
				setFilters({
					paged: newView.page ?? 1,
					number: newView.perPage ?? 10,
				});
				invalidate('getCustomers');
			}}
			actions={actions}
			paginationInfo={{
				totalItems,
				totalPages,
			}}
			getItemId={(item: Customer) => String(item.id ?? 0)}
			search={false}
			defaultLayouts={{ table: {} }}
		/>
	);
}
