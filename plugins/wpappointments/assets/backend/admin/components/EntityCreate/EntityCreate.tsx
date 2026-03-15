import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Button, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
import useSlideout from '~/backend/hooks/useSlideout';
import { Entity } from '~/backend/types';
import { HtmlForm, withForm } from '../Form/Form';
import Input from '../FormField/Input/Input';
import Toggle from '../FormField/Toggle/Toggle';
import FormFieldSet from '../FormFieldSet/FormFieldSet';
import SlideOut from '../SlideOut/SlideOut';
import {
	entitiesApi,
	CreateEntityData,
	UpdateEntityData,
} from '~/backend/api/entities';

export type EntityFormData = {
	id?: number;
	name: string;
	description?: string;
	type?: string;
	capacity?: number;
	active?: boolean;
	scheduleMode?: 'inherit' | 'own';
	bufferBefore?: number;
	bufferAfter?: number;
	sortOrder?: number;
};

type EntityCreateProps = {
	onSubmitSuccess?: (data: Entity) => void;
	invalidateCache?: (selector: string) => void;
};

export default withForm(function EntityCreate({
	onSubmitSuccess,
	invalidateCache,
}: EntityCreateProps) {
	const { currentSlideout, closeCurrentSlideOut } = useSlideout();
	const { data } = currentSlideout || {};
	const { selectedEntity, mode, parentId } = (data as any) || {};

	if (mode === 'edit' && selectedEntity) {
		useFillFormValues(selectedEntity);
	}

	const [isActive, setIsActive] = useState<boolean>(
		selectedEntity?.active ?? true
	);

	const [scheduleMode, setScheduleMode] = useState<string>(
		selectedEntity?.scheduleMode ?? 'inherit'
	);

	const onSubmit: SubmitHandler<EntityFormData> = async (formData) => {
		const { createEntity, updateEntity } = entitiesApi({
			invalidateCache,
		});

		if (mode === 'edit' && selectedEntity?.id) {
			const updateData: UpdateEntityData = {
				...formData,
				id: selectedEntity.id,
				parentId: selectedEntity.parentId,
				capacity: formData.capacity ? Number(formData.capacity) : 1,
				bufferBefore: formData.bufferBefore
					? Number(formData.bufferBefore)
					: 0,
				bufferAfter: formData.bufferAfter
					? Number(formData.bufferAfter)
					: 0,
				sortOrder: formData.sortOrder ? Number(formData.sortOrder) : 0,
				scheduleMode: scheduleMode as 'inherit' | 'own',
			};

			const response = await updateEntity(updateData);

			if (response && response.status === 'success') {
				const { entity } = response.data;

				if (onSubmitSuccess) {
					onSubmitSuccess(entity as Entity);
				}
			}
		} else {
			const createData: CreateEntityData = {
				name: formData.name,
				parentId: parentId ?? 0,
				description: formData.description,
				type: formData.type,
				capacity: formData.capacity ? Number(formData.capacity) : 1,
				active: formData.active ?? true,
				bufferBefore: formData.bufferBefore
					? Number(formData.bufferBefore)
					: 0,
				bufferAfter: formData.bufferAfter
					? Number(formData.bufferAfter)
					: 0,
				sortOrder: formData.sortOrder ? Number(formData.sortOrder) : 0,
				scheduleMode: scheduleMode as 'inherit' | 'own',
			};

			const response = await createEntity(createData);

			if (response && response.status === 'success') {
				const { entity } = response.data;

				if (onSubmitSuccess) {
					onSubmitSuccess(entity as Entity);
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
			? __('Edit Entity', 'wpappointments')
			: __('New Entity', 'wpappointments');

	return (
		<SlideOut title={title} id="entity">
			<HtmlForm onSubmit={onSubmit}>
				<FormFieldSet>
					<Input
						name="name"
						label={__('Name', 'wpappointments')}
						rules={{ required: true }}
					/>
					<Input
						name="description"
						label={__('Description', 'wpappointments')}
					/>
					<Input
						name="type"
						label={__('Type', 'wpappointments')}
						placeholder={__(
							'e.g. room, table, equipment',
							'wpappointments'
						)}
					/>
					<Input
						name="capacity"
						label={__('Capacity', 'wpappointments')}
						type="number"
					/>
					<SelectControl
						label={__('Schedule Mode', 'wpappointments')}
						value={scheduleMode}
						options={[
							{
								label: __(
									'Inherit from parent',
									'wpappointments'
								),
								value: 'inherit',
							},
							{
								label: __('Own schedule', 'wpappointments'),
								value: 'own',
							},
						]}
						onChange={(value: string) => setScheduleMode(value)}
					/>
					<Input
						name="bufferBefore"
						label={__('Buffer before (minutes)', 'wpappointments')}
						type="number"
					/>
					<Input
						name="bufferAfter"
						label={__('Buffer after (minutes)', 'wpappointments')}
						type="number"
					/>
					<Input
						name="sortOrder"
						label={__('Sort Order', 'wpappointments')}
						type="number"
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
