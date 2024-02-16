import { SubmitHandler, useFormContext } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import useSlideout from '~/backend/hooks/useSlideout';
import { Customer } from '~/backend/store/customers/customers.types';
import { store } from '~/backend/store/store';
import { AppointmentFormFields } from '../AppointmentForm/AppoitmentForm';
import { HtmlForm, withForm } from '../Form/Form';
import Checkbox from '../FormField/Checkbox/Checkbox';
import Input from '../FormField/Input/Input';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import { customersApi } from '~/backend/api/customers';

export type CustomerCreateFormData = {
	id?: number;
	name: string;
	email: string;
	phone: string;
	createAccount: boolean;
};

export default withForm(function CustomerCreate() {
	const { reset } = useFormContext<AppointmentFormFields>();
	const dispatch = useDispatch(store);
	const { closeCurrentSlideOut } = useSlideout();

	const onSubmit: SubmitHandler<CustomerCreateFormData> = async (data) => {
		const { createCustomer } = customersApi();
		const { createAccount, ...rest } = data;

		if (createAccount) {
			const response = await createCustomer(rest);

			if (response) {
				const { data: responseData } = response;
				const { customer } = responseData;
				dispatch.setSelectedCustomer(customer as Customer);
			}
		} else {
			dispatch.createCustomer(rest as Customer);
			dispatch.setSelectedCustomer(rest as Customer);
		}

		closeCurrentSlideOut();
		reset();
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFieldSet>
				<Input name="name" label="Name" rules={{ required: true }} />
				<Input name="email" label="Email" type="email" />
				<Input name="phone" label="Phone" />
				<Checkbox
					name="createAccount"
					label="Create account"
					defaultValue={true}
				/>
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
				Create
			</Button>
		</HtmlForm>
	);
});
