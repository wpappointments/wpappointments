import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Button, SelectControl } from '@wordpress/components';
import { select, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { store } from '~/backend/store/store';
import { Service, ServiceCategory } from '~/backend/types';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
import Toggle from '../FormField/Toggle/Toggle';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import { serviceCategoriesApi } from '~/backend/api/service-categories';
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
	categoryId?: string;
	image?: string;
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

	const [imageUrl, setImageUrl] = useState<string>(
		selectedService?.image ?? ''
	);
	const [imageId, setImageId] = useState<string>(
		selectedService?.image ?? ''
	);

	const [newCategoryName, setNewCategoryName] = useState('');
	const [showNewCategory, setShowNewCategory] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
		selectedService?.category?.id ? String(selectedService.category.id) : ''
	);

	const categories: ServiceCategory[] = useSelect(() => {
		return select(store).getServiceCategories() ?? [];
	}, []);

	const categoryOptions = [
		{ label: __('— No category —', 'wpappointments'), value: '' },
		...categories.map((cat) => ({
			label: cat.name,
			value: String(cat.id),
		})),
		{
			label: __('+ Add new category', 'wpappointments'),
			value: '__new__',
		},
	];

	const handleCategoryChange = (value: string) => {
		if (value === '__new__') {
			setShowNewCategory(true);
			setSelectedCategoryId('');
		} else {
			setShowNewCategory(false);
			setSelectedCategoryId(value);
		}
	};

	const handleAddNewCategory = async () => {
		if (!newCategoryName.trim()) {
			return;
		}
		const { createServiceCategory } = serviceCategoriesApi({
			invalidateCache,
		});
		const response = await createServiceCategory({
			name: newCategoryName.trim(),
		});
		if (response && response.status === 'success') {
			const { category } = response.data;
			setSelectedCategoryId(String(category.id));
			setNewCategoryName('');
			setShowNewCategory(false);
		}
	};

	const openMediaPicker = () => {
		const frame = window.wp.media({
			title: __('Select Service Image', 'wpappointments'),
			button: { text: __('Use this image', 'wpappointments') },
			multiple: false,
			library: { type: 'image' },
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			setImageUrl(attachment.url);
			setImageId(String(attachment.id));
		});

		frame.open();
	};

	const clearImage = () => {
		setImageUrl('');
		setImageId('');
	};

	const onSubmit: SubmitHandler<ServiceFormData> = async (formData) => {
		const { createService, updateService } = servicesApi({
			invalidateCache,
		});

		const category = selectedCategoryId || null;

		if (mode === 'edit' && selectedService?.id) {
			const updateData: UpdateServiceData = {
				...formData,
				id: selectedService.id,
				price: formData.price ? Number(formData.price) : 0,
				category: category ? Number(category) : null,
				image: imageId || '',
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
				category: category ? Number(category) : null,
				image: imageId || '',
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
					<div>
						<SelectControl
							label={__('Category', 'wpappointments')}
							value={
								showNewCategory ? '__new__' : selectedCategoryId
							}
							options={categoryOptions}
							onChange={handleCategoryChange}
							size="__unstable-large"
						/>
						{showNewCategory && (
							<div
								style={{
									display: 'flex',
									gap: 8,
									marginTop: 4,
								}}
							>
								<input
									type="text"
									className="components-text-control__input"
									placeholder={__(
										'New category name',
										'wpappointments'
									)}
									value={newCategoryName}
									onChange={(e) =>
										setNewCategoryName(e.target.value)
									}
									style={{ flex: 1 }}
								/>
								<Button
									variant="secondary"
									onClick={handleAddNewCategory}
								>
									{__('Add', 'wpappointments')}
								</Button>
								<Button
									variant="tertiary"
									onClick={() => {
										setShowNewCategory(false);
										setNewCategoryName('');
									}}
								>
									{__('Cancel', 'wpappointments')}
								</Button>
							</div>
						)}
					</div>
					<div>
						<p
							style={{
								marginBottom: 4,
								fontSize: 11,
								fontWeight: 500,
								textTransform: 'uppercase',
							}}
						>
							{__('Image', 'wpappointments')}
						</p>
						{imageUrl ? (
							<div style={{ marginBottom: 8 }}>
								<img
									src={imageUrl}
									alt=""
									style={{
										maxWidth: '100%',
										maxHeight: 120,
										display: 'block',
										marginBottom: 8,
										borderRadius: 4,
									}}
								/>
								<Button
									variant="secondary"
									isDestructive
									onClick={clearImage}
									size="small"
								>
									{__('Remove image', 'wpappointments')}
								</Button>
							</div>
						) : (
							<Button
								variant="secondary"
								onClick={openMediaPicker}
							>
								{__('Select image', 'wpappointments')}
							</Button>
						)}
					</div>
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
