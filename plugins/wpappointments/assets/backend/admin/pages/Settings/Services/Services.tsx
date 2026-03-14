import { useEffect, useState } from 'react';
import {
	Button,
	PanelBody,
	PanelRow,
	TextControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import useSlideout from '~/backend/hooks/useSlideout';
import { Service } from '~/backend/types';
import SlideOut from '~/backend/admin/components/SlideOut/SlideOut';
import { servicesApi } from '~/backend/api/services';

export default function Services() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingService, setEditingService] =
		useState<Partial<Service> | null>(null);
	const { getServices, createService, updateService, deleteService } =
		servicesApi();
	const { openSlideOut, closeSlideOut, isSlideoutOpen } = useSlideout();

	const SLIDEOUT_ID = 'service-editor';

	const fetchServices = async () => {
		setIsLoading(true);
		const data = await getServices();
		setServices(data.services || []);
		setIsLoading(false);
	};

	useEffect(() => {
		fetchServices();
	}, []);

	const handleSaveService = async () => {
		if (!editingService?.name) return;

		if (editingService.id) {
			await updateService(editingService.id, editingService);
		} else {
			await createService({ ...editingService, duration: 30 });
		}

		setEditingService(null);
		closeSlideOut(SLIDEOUT_ID);
		fetchServices();
	};

	const handleDeleteService = async (id: number) => {
		if (
			!confirm(
				__(
					'Are you sure you want to delete this service?',
					'wpappointments'
				)
			)
		)
			return;
		await deleteService(id);
		fetchServices();
	};

	const handleToggleActive = async (service: Service) => {
		if (!service.id) return;
		const newStatus = !service.active;
		await updateService(service.id, { active: newStatus });
		fetchServices();
	};

	const openEditor = (service: Partial<Service> | null = null) => {
		setEditingService(service || { name: '', active: true });
		openSlideOut({ id: SLIDEOUT_ID });
	};

	return (
		<>
			<PanelBody title={__('Manage Services', 'wpappointments')}>
				<PanelRow>
					<div style={{ width: '100%' }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								marginBottom: '20px',
							}}
						>
							<p style={{ margin: 0 }}>
								{__(
									'Manage the services types users can book appointments for.',
									'wpappointments'
								)}
							</p>
							<Button
								variant="primary"
								onClick={() => openEditor()}
							>
								{__('Add Service', 'wpappointments')}
							</Button>
						</div>

						{isLoading ? (
							/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
							/* @ts-ignore */
							<Spinner />
						) : (
							<table className="wp-list-table widefat fixed striped">
								<thead>
									<tr>
										<th>{__('Name', 'wpappointments')}</th>
										<th style={{ width: '100px' }}>
											{__('Active', 'wpappointments')}
										</th>
										<th style={{ width: '150px' }}>
											{__('Actions', 'wpappointments')}
										</th>
									</tr>
								</thead>
								<tbody>
									{services.length === 0 ? (
										<tr>
											<td colSpan={3}>
												{__(
													'No services found.',
													'wpappointments'
												)}
											</td>
										</tr>
									) : (
										services.map((service) => (
											<tr key={service.id}>
												<td>{service.name}</td>
												<td>
													<ToggleControl
														label=""
														checked={service.active}
														onChange={() =>
															handleToggleActive(
																service
															)
														}
													/>
												</td>
												<td>
													<Button
														variant="link"
														onClick={() =>
															openEditor(service)
														}
													>
														{__(
															'Edit',
															'wpappointments'
														)}
													</Button>
													<Button
														variant="link"
														isDestructive
														onClick={() =>
															service.id &&
															handleDeleteService(
																service.id
															)
														}
													>
														{__(
															'Delete',
															'wpappointments'
														)}
													</Button>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						)}
					</div>
				</PanelRow>
			</PanelBody>

			{isSlideoutOpen(SLIDEOUT_ID) && (
				<SlideOut
					id={SLIDEOUT_ID}
					title={
						editingService?.id
							? __('Edit Service', 'wpappointments')
							: __('Add Service', 'wpappointments')
					}
				>
					<div style={{ padding: '20px' }}>
						<TextControl
							label={__('Service Name', 'wpappointments')}
							value={editingService?.name || ''}
							onChange={(val) =>
								setEditingService({
									...editingService,
									name: val,
								})
							}
						/>
						<TextControl
							label={__('Duration (minutes)', 'wpappointments')}
							type="number"
							value={editingService?.duration?.toString() || '30'}
							onChange={(val) =>
								setEditingService({
									...editingService,
									duration: parseInt(val),
								})
							}
						/>
						<div
							style={{
								marginTop: '20px',
								display: 'flex',
								gap: '10px',
							}}
						>
							<Button
								variant="primary"
								onClick={handleSaveService}
							>
								{__('Save Service', 'wpappointments')}
							</Button>
							<Button
								variant="tertiary"
								onClick={() => closeSlideOut(SLIDEOUT_ID)}
							>
								{__('Cancel', 'wpappointments')}
							</Button>
						</div>
					</div>
				</SlideOut>
			)}
		</>
	);
}
