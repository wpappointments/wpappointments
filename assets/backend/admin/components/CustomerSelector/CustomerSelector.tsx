import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { InputControl } from '~/backend/utils/experimental';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { AppointmentFormFields } from '../AppointmentForm/AppointmentForm';
import SlideOut from '../SlideOut/SlideOut';
import styles from './CustomerSelector.module.css';


export default function CustomerSelector() {
	const { setValue } = useFormContext<AppointmentFormFields>();
	const { closeCurrentSlideOut } = useSlideout();
	const [searchValue, setSearchValue] = useState('');

	const { customers } = useSelect(() => {
		return select(store).getCustomers();
	}, [searchValue]);

	const filteredCustomers = customers.filter((customer) => {
		if (searchValue === '') {
			return true;
		}

		const search = searchValue.toLowerCase();
		const name = customer.name.toLowerCase();
		const email = customer?.email?.toLowerCase();
		const phone = customer?.phone?.toLowerCase();

		let match = false;

		if (name.includes(search)) {
			match = true;
		}

		if (email && email.includes(search)) {
			match = true;
		}

		if (phone && phone.includes(search)) {
			match = true;
		}

		return match;
	});

	const dispatch = useDispatch(store);

	const selectCustomer = (id: number) => {
		const selectedCustomer = customers.find(
			(customer) => customer.id === id
		);

		if (selectedCustomer) {
			setValue('customer', JSON.stringify(selectedCustomer));
			setValue('customerId', id);
			dispatch.setSelectedCustomer(selectedCustomer);
			closeCurrentSlideOut();
		}
	};

	return (
		<SlideOut
			title={__('Select Customer', 'wpappointments')}
			id="select-customer"
		>
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
									if (!customer.id) {
										return;
									}

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
		</SlideOut>
	);
}
