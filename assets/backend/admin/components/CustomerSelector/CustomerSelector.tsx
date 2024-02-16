import { useState } from 'react';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { InputControl } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import styles from './CustomerSelector.module.css';

export default function CustomerSelector() {
	const { closeCurrentSlideOut } = useSlideout();
	const [searchValue, setSearchValue] = useState('');

	const customers = useSelect(() => {
		return select(store).getAllCustomers();
	}, [searchValue]);

	const filteredCustomers = customers.filter((customer) => {
		if (searchValue === '') {
			return true;
		}

		const search = searchValue.toLowerCase();
		const name = customer.name.toLowerCase();
		const email = customer.email.toLowerCase();
		const phone = customer.phone.toLowerCase();

		return (
			name.includes(search) ||
			email.includes(search) ||
			phone.includes(search)
		);
	});

	const dispatch = useDispatch(store);

	const selectCustomer = (id: number) => {
		const selectedCustomer = customers.find(
			(customer) => customer.id === id
		);

		if (selectedCustomer) {
			dispatch.setSelectedCustomer(selectedCustomer);
			closeCurrentSlideOut();
		}
	};

	return (
		<div>
			<InputControl
				label={__('Search for a customer', 'wpappointments')}
				placeholder={__(
					'Search by name, email or phone number',
					'wpappointments'
				)}
				onChange={(value) => {
					setSearchValue(value || '');
				}}
				value={searchValue}
				size="__unstable-large"
				id="search-customer"
				type="text"
				className={styles.input}
			/>
			{filteredCustomers && filteredCustomers.length > 0 && (
				<>
					<div className={styles.tableHeader}>
						<span>{__('Name', 'wpappointments')}</span>
						<span>{__('Email', 'wpappointments')}</span>
						<span>{__('Phone', 'wpappointments')}</span>
					</div>
					<div className={styles.customers}>
						{filteredCustomers.map((customer) => (
							<div
								className={styles.customer}
								key={customer.id}
								onClick={() => {
									selectCustomer(customer.id);
								}}
							>
								<span>{customer.name}</span>
								<span>{customer.email}</span>
								<span>{customer.phone}</span>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
