import { SubmitHandler } from 'react-hook-form';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { Service } from '~/backend/types';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
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

	const onSubmit: SubmitHandler<ServiceFormData> = async (formData) => {
		const { createService, updateService } = servicesApi({
			invalidateCache,
		});

		if (mode === 'edit' && selectedService?.id) {
			const updateData: UpdateServiceData = {
				...formData,
				id: selectedService.id,
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
						name="description"
						label={__('Description', 'wpappointments')}
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
