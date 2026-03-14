import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	PanelRow,
	TextControl,
	Spinner,
} from '@wordpress/components';
import { servicesApi } from '~/backend/api/services';
import { Service } from '~/backend/types';

export default function Services() {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newName, setNewName] = useState('');
	const { getServices, createService, deleteService } = servicesApi();

	const fetchServices = async () => {
		setIsLoading(true);
		const data = await getServices();
		setServices(data.services || []);
		setIsLoading(false);
	};

	useEffect(() => {
		fetchServices();
	}, []);

	const handleCreateService = async () => {
		if (!newName) return;
		await createService({ name: newName, duration: 30 });
		setNewName('');
		fetchServices();
	};

	const handleDeleteService = async (id: number) => {
		if (!confirm(__('Are you sure you want to delete this service?', 'wpappointments'))) return;
		await deleteService(id);
		fetchServices();
	};

	return (
		<PanelBody title={__('Manage Services', 'wpappointments')}>
			<PanelRow>
				<div style={{ width: '100%' }}>
					<p>
						{__('Manage the services types users can book appointments for.', 'wpappointments')}
					</p>

					<div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
						<TextControl
							label={__('New Service Name', 'wpappointments')}
							value={newName}
							onChange={setNewName}
							hideLabelFromVision
							placeholder={__('Enter service name...', 'wpappointments')}
						/>
						<Button variant="primary" onClick={handleCreateService}>
							{__('Add Service', 'wpappointments')}
						</Button>
					</div>

					{isLoading ? (
						<Spinner />
					) : (
						<table className="wp-list-table widefat fixed striped">
							<thead>
								<tr>
									<th>{__('Name', 'wpappointments')}</th>
									<th style={{ width: '100px' }}>{__('Actions', 'wpappointments')}</th>
								</tr>
							</thead>
							<tbody>
								{services.length === 0 ? (
									<tr>
										<td colSpan={2}>{__('No services found.', 'wpappointments')}</td>
									</tr>
								) : (
									services.map((service) => (
										<tr key={service.id}>
											<td>{service.name}</td>
											<td>
												<Button
													variant="link"
													isDestructive
													onClick={() => service.id && handleDeleteService(service.id)}
												>
													{__('Delete', 'wpappointments')}
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
	);
}
