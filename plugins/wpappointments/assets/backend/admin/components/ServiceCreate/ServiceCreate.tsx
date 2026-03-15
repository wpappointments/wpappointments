import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { Service } from '~/backend/types';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
import Toggle from '../FormField/Toggle/Toggle';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import {
	servicesApi,
	CreateServiceData,
	UpdateServiceData,
} from '~/backend/api/services';

export type ServiceFormData = {
	id?: number;
	name: string;
	duration: number;
	description?: string;
	active?: boolean;
	price?: number;
};

type ServiceCreateProps = {
	onSubmitSuccess?: (data: Service) => void;
	invalidateCache?: (selector: string) => void;
};

export default withForm(function ServiceCreate({
	onSubmitSuccess,
	invalidateCache,
}: ServiceCreateProps) {
	const { currentSlideout, closeCurrentSlideOut } = useSlideout();
	const { data } = currentSlideout || {};
	const { selectedService, mode } = (data as any) || {};

	if (mode === 'edit' && selectedService) {
		useFillFormValues(selectedService);
	}

	const [isActive, setIsActive] = useState<boolean>(
		selectedService?.active ?? true
	);

	const onSubmit: SubmitHandler<ServiceFormData> = async (formData) => {
		const { createService, updateService } = servicesApi({
			invalidateCache,
		});

		if (mode === 'edit' && selectedService?.id) {
			const updateData: UpdateServiceData = {
				...formData,
				id: selectedService.id,
				price: formData.price ? Number(formData.price) : 0,
			};

			const response = await updateService(updateData);

			if (response && response.status === 'success') {
				const { service } = response.data;

				if (onSubmitSuccess) {
					onSubmitSuccess(service as Service);
				}
			}
		} else {
			const createData: CreateServiceData = {
				name: formData.name,
				duration: formData.duration,
				description: formData.description,
				active: formData.active ?? true,
				price: formData.price ? Number(formData.price) : 0,
			};

			const response = await createService(createData);

			if (response && response.status === 'success') {
				const { service } = response.data;

				if (onSubmitSuccess) {
					onSubmitSuccess(service as Service);
				}
			}
		}

		closeCurrentSlideOut();
	};

	const submitText =
		mode === 'edit'
			? __('Update', 'wpappointments')
			: __('Create', 'wpappointments');

	const title =
		mode === 'edit'
			? __('Edit Service', 'wpappointments')
			: __('New Service', 'wpappointments');

	return (
		<SlideOut title={title} id="service">
			<HtmlForm onSubmit={onSubmit}>
				<FormFieldSet>
					<Input
						name="name"
						label={__('Name', 'wpappointments')}
						rules={{ required: true }}
					/>
					<Input
						name="duration"
						label={__('Duration (minutes)', 'wpappointments')}
						type="number"
						rules={{ required: true, min: 1 }}
					/>
					<Input
						name="price"
						label={__('Price', 'wpappointments')}
						type="number"
					/>
					<Input
						name="description"
						label={__('Description', 'wpappointments')}
					/>
					<Toggle
						name="active"
						label={__('Active', 'wpappointments')}
						defaultChecked={isActive}
						onChange={(value: boolean) => setIsActive(value)}
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
					{submitText}
				</Button>
			</HtmlForm>
		</SlideOut>
	);
});
