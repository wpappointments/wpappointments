import { SubmitHandler } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { select, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { HtmlForm, withForm } from '../Form/Form';
import Checkbox from '../FormField/Checkbox/Checkbox';
import Input from '../FormField/Input/Input';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import { customersApi } from '~/backend/api/customers';
import { CreateResponse, UpdateResponse } from '~/backend/api/customers';

export type CustomerFormData = {
	id?: number;
	name: string;
	email: string;
	phone: string;
	createAccount: boolean;
};

export default withForm(function CustomerCreate() {
	const dispatch = useDispatch(store);
	const { currentSlideout, closeCurrentSlideOut } = useSlideout();
	const { data } = currentSlideout || {};
	const { selectedCustomer, mode } = (data as any) || {};

	if (mode === 'edit' && selectedCustomer) {
		useFillFormValues(selectedCustomer);
	}

	const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
		const { createCustomer, updateCustomer } = customersApi();

		let response: CreateResponse | UpdateResponse | null = null;

		if (mode === 'create') {
			response = await createCustomer(data);
		} else if ('id' in data && typeof data.id === 'number') {
			response = await updateCustomer(data as Required<CustomerFormData>);
		}

		if (response) {
			const {
				customers,
				totalItems,
				totalPages,
				postsPerPage,
				currentPage,
			} = select(store).getCustomers();

			dispatch.setCustomers(
				customers,
				totalItems,
				totalPages,
				postsPerPage,
				currentPage
			);
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
