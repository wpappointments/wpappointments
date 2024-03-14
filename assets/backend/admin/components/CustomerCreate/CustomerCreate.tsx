import { SubmitHandler } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Customer } from '~/backend/types';
import { HtmlForm, withForm } from '../Form/Form';
import Checkbox from '../FormField/Checkbox/Checkbox';
import Input from '../FormField/Input/Input';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import { customersApi, UpdateCustomerData } from '~/backend/api/customers';


export type CustomerFormData = {
	id?: number;
	name: string;
	email: string;
	phone: string;
	createAccount: boolean;
};

type CustomerCreateProps = {
	onSubmitSuccess?: (data: Customer) => void;
};

export default withForm(function CustomerCreate({
	onSubmitSuccess,
}: CustomerCreateProps) {
	const dispatch = useDispatch(store);
	const { currentSlideout, closeCurrentSlideOut } = useSlideout();
	const { data } = currentSlideout || {};
	const { selectedCustomer, mode, screen } = (data as any) || {};

	if (mode === 'edit' && selectedCustomer) {
		useFillFormValues(selectedCustomer);
	}

	const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
		const { createCustomer, updateCustomer } = customersApi();
		const { createAccount, ...rest } = data;

		if (createAccount) {
			const response = await createCustomer(rest);

			if (response) {
				const { data: responseData } = response;
				const { customer } = responseData;
				dispatch.setSelectedCustomer(customer as Customer);

				if (onSubmitSuccess) {
					onSubmitSuccess(customer as Customer);
				}
			}
		} else {
			if (mode === 'create') {
				dispatch.createCustomer(rest as Customer);
			}

			dispatch.setSelectedCustomer(rest as Customer);

			if (onSubmitSuccess) {
				onSubmitSuccess(rest as Customer);
			}
		}

		if (mode === 'edit') {
			const response = await updateCustomer(data as UpdateCustomerData);

			if (response) {
				const { data: responseData } = response;
				const { customer } = responseData;
				dispatch.updateCustomer(customer as Customer);

				if (onSubmitSuccess) {
					onSubmitSuccess(customer as Customer);
				}
			}
		}

		closeCurrentSlideOut();
	};

	const submitText = mode === 'create' ? 'Create' : 'Update';
	const title =
		mode === 'create'
			? __('New Customer', 'wpappointments')
			: __('Update Customer', 'wpappointments');

	return (
		<SlideOut title={title} id="customer">
			<HtmlForm onSubmit={onSubmit}>
				<FormFieldSet>
					<Input
						name="name"
						label="Name"
						rules={{ required: true }}
					/>
					<Input name="email" label="Email" type="email" />
					<Input name="phone" label="Phone" />
					{mode === 'create' && (
						<Checkbox
							name="createAccount"
							label="Create account"
							defaultValue={true}
							style={{
								display: screen === 'customers' ? 'none' : 'flex',
							}}
						/>
					)}
				</FormFieldSet>
				<Button
					variant="primary"
					type="submit"
					style={{
						width: '100%',
						justifyContent: 'center',
						padding: '22px 0px',
						marginTop: '34px',
					}}
				>
					{submitText}
				</Button>
			</HtmlForm>
		</SlideOut>
	);
});
