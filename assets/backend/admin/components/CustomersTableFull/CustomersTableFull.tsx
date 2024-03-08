import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { edit as editIcon, Icon, info, trash } from '@wordpress/icons';
import { Customer } from '~/backend/types';
import Empty from '~/backend/admin/components/TableFull/Empty/Empty';
import Table from '~/backend/admin/components/TableFull/Table/Table';

type Props = {
	items?: Customer[];
	onEmptyStateButtonClick?: () => void;
	onEdit?: (appointment: Customer) => void;
	onView?: (appointment: Customer) => void;
	emptyStateMessage?: string;
};

export default function CustomersTableFull({
	items,
	onEmptyStateButtonClick,
	onEdit,
	onView,
	emptyStateMessage,
}: Props) {
	if (!items || items.length === 0) {
		return (
			<Empty>
				<p>
					{emptyStateMessage ||
						__('You have no customers yet', 'wpappointments')}
				</p>
				<Button variant="primary" onClick={onEmptyStateButtonClick}>
					{__('Create New Customer', 'wpappointments')}
				</Button>
			</Empty>
		);
	}

	return (
		<Table>
			<thead>
				<tr>
					<th>{__('Name', 'wpappointments')}</th>
					<th>{__('Email', 'wpappointments')}</th>
					<th>{__('Phone', 'wpappointments')}</th>
					<th style={{ width: 80 }}></th>
				</tr>
			</thead>
			<tbody>
				{items.map((row) => (
					<TableRow
						key={row.id}
						row={row}
						edit={onEdit}
						view={onView}
					/>
				))}
			</tbody>
		</Table>
	);
}

type TableRowProps = {
	row: Customer;
	edit?: (appointment: Customer) => void;
	view?: (appointment: Customer) => void;
	setCustomerModal: Dispatch<
		SetStateAction<{
			id: number;
		} | null>
	>;
	hideActions?: boolean;
};

function TableRow({ row, edit, view, setCustomerModal }: TableRowProps) {
	const { id, name, phone, email } = row;

	return (
		<tr key={id}>
			<td>
				<Button
					variant="link"
					onClick={() => {
						view && view(row);
					}}
					style={{ marginBottom: '5px' }}
				>
					<strong>{name}</strong>
				</Button>
			</td>
			<td>{email}</td>
			<td>{phone}</td>
			<td className="">
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						view && view(row);
					}}
					icon={<Icon icon={info} />}
					label={__('View customer details', 'wpappointments')}
				/>
				<Button
					variant="tertiary"
					size="small"
					onClick={() => {
						edit && edit(row);
					}}
					icon={<Icon icon={editIcon} />}
					label={__('Edit customer details', 'wpappointments')}
				/>
				<Button
					variant="tertiary"
					size="small"
					isDestructive
					onClick={() => {
						setCustomerModal({ id });
					}}
					icon={<Icon icon={trash} />}
					label={__('Delete customer', 'wpappointments')}
				/>
			</td>
		</tr>
	);
}
