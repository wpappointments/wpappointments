import { useState } from 'react';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	CheckboxInput,
	DataForm,
	FormFieldSet,
	SlideOut,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
import { useSlideout } from '@wpappointments/data';
import { store } from '~/backend/store/store';
import { Customer } from '~/backend/types';
import { customersApi, UpdateCustomerData } from '~/backend/api/customers';

type CustomerFormData = {
	name: string;
	email: string;
	phone: string;
	createAccount: boolean;
};

type CustomerCreateProps = {
	onSubmitSuccess?: (data: Customer) => void;
};

const emptyCustomer: CustomerFormData = {
	name: '',
	email: '',
	phone: '',
	createAccount: true,
};

export default function CustomerCreate({
	onSubmitSuccess,
}: CustomerCreateProps) {
	const dispatch = useDispatch(store);
	const { currentSlideout, closeCurrentSlideOut } = useSlideout();
	const { data: slideoutData } = currentSlideout || {};
	const { selectedCustomer, mode, screen } =
		(slideoutData as {
			selectedCustomer?: Customer;
			mode?: string;
			screen?: string;
		}) || {};

	const [formData, setFormData] = useState<CustomerFormData>(() => {
		if (mode === 'edit' && selectedCustomer) {
			return {
				name: selectedCustomer.name ?? '',
				email: selectedCustomer.email ?? '',
				phone: selectedCustomer.phone ?? '',
				createAccount: false,
			};
		}
		return { ...emptyCustomer };
	});

	const fields: Field<CustomerFormData>[] = [
		{
			id: 'name',
			type: 'text',
			label: __('Name', 'wpappointments'),
			isValid: { required: true },
			Edit: TextInput,
		},
		{
			id: 'email',
			type: 'email',
			label: __('Email', 'wpappointments'),
			Edit: TextInput,
		},
		{
			id: 'phone',
			type: 'telephone',
			label: __('Phone', 'wpappointments'),
			Edit: TextInput,
		},
		{
			id: 'createAccount',
			type: 'boolean',
			label: __('Create account', 'wpappointments'),
			isVisible: () => mode === 'create' && screen !== 'customers',
			Edit: CheckboxInput,
		},
	];

	const form: Form = {
		layout: { type: 'regular' },
		fields: ['name', 'email', 'phone', 'createAccount'],
	};

	const { validity, isValid } = useFormValidity(formData, fields, form);

	const handleChange = (edits: Record<string, unknown>) => {
		setFormData((prev) => ({ ...prev, ...edits }));
	};

	const handleSubmit = async () => {
		if (!isValid) {
			return;
		}

		const { createCustomer, updateCustomer } = customersApi();
		const { createAccount, ...rest } = formData;

		if (mode === 'edit') {
			const response = await updateCustomer({
				id: selectedCustomer?.id,
				...rest,
			} as UpdateCustomerData);

			if (response) {
				const { data: responseData } = response;
				const { customer } = responseData;
				dispatch.updateCustomer(customer as Customer);
				onSubmitSuccess?.(customer as Customer);
			}
		} else if (createAccount) {
			const response = await createCustomer(rest);

			if (response) {
				const { data: responseData } = response;
				const { customer } = responseData;
				dispatch.setSelectedCustomer(customer as Customer);
				onSubmitSuccess?.(customer as Customer);
			}
		} else {
			dispatch.createCustomer(rest as Customer);
			dispatch.setSelectedCustomer(rest as Customer);
			onSubmitSuccess?.(rest as Customer);
		}

		closeCurrentSlideOut();
	};

	const submitText =
		mode === 'create'
			? __('Create', 'wpappointments')
			: __('Update', 'wpappointments');
	const title =
		mode === 'create'
			? __('New Customer', 'wpappointments')
			: __('Update Customer', 'wpappointments');

	return (
		<SlideOut title={title} id="customer">
			<FormFieldSet>
				<DataForm
					data={formData}
					fields={fields}
					form={form}
					onChange={handleChange}
					validity={validity}
				/>
			</FormFieldSet>
			<Button
				variant="primary"
				onClick={handleSubmit}
				disabled={!isValid}
				style={{
					width: '100%',
					justifyContent: 'center',
					padding: '22px 0px',
					marginTop: '34px',
				}}
			>
				{submitText}
			</Button>
		</SlideOut>
	);
}
