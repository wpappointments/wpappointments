import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Service } from '~/backend/types';
import styles from '../OnboardingWizard.module.css';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import { servicesApi, CreateServiceData } from '~/backend/api/services';

type ServiceFormData = {
	name: string;
	duration: number;
};

type ServicesProps = {
	onSuccess: () => void;
};

function AddServiceForm({ onAdd }: { onAdd: (service: Service) => void }) {
	const onSubmit = async (data: ServiceFormData) => {
		const { createService } = servicesApi();
		const serviceData: CreateServiceData = {
			name: data.name,
			duration: Number(data.duration),
			active: true,
		};

		const response = await createService(serviceData);

		if (response && response.status === 'success') {
			onAdd(response.data.service as Service);
		}
	};

	return (
		<HtmlForm onSubmit={onSubmit}>
			<FormFieldSet style={{ marginBottom: 16 }}>
				<Input
					name="name"
					label={__('Service name', 'wpappointments')}
					placeholder={__('e.g. Consultation', 'wpappointments')}
					rules={{ required: true }}
				/>
				<Input
					name="duration"
					label={__('Duration (minutes)', 'wpappointments')}
					type="number"
					rules={{ required: true, min: 1 }}
				/>
			</FormFieldSet>
			<Button variant="secondary" type="submit">
				{__('Add Service', 'wpappointments')}
			</Button>
		</HtmlForm>
	);
}

const AddServiceFormWithForm = withForm(AddServiceForm);

function ServicesStep({ onSuccess }: ServicesProps) {
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const { getServices } = servicesApi();

		setIsLoading(true);

		Promise.resolve(getServices()).then((result: any) => {
			setServices(result?.services || []);
			setIsLoading(false);
		});
	}, []);

	const handleAdd = (service: Service) => {
		setServices((prev) => [...prev, service]);
	};

	const handleDelete = async (id: number) => {
		const { deleteService } = servicesApi();
		await deleteService(id);
		setServices((prev) => prev.filter((s) => s.id !== id));
	};

	return (
		<div>
			{services.length > 0 && (
				<table
					className="wp-list-table widefat fixed striped"
					style={{ marginBottom: 24 }}
				>
					<thead>
						<tr>
							<th>{__('Name', 'wpappointments')}</th>
							<th style={{ width: 120 }}>
								{__('Duration (min)', 'wpappointments')}
							</th>
							<th style={{ width: 80 }}>
								{__('Remove', 'wpappointments')}
							</th>
						</tr>
					</thead>
					<tbody>
						{services.map((service) => (
							<tr key={service.id}>
								<td>{service.name}</td>
								<td>{service.duration ?? '—'}</td>
								<td>
									<Button
										variant="link"
										isDestructive
										onClick={() =>
											service.id &&
											handleDelete(service.id)
										}
									>
										{__('Remove', 'wpappointments')}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{!isLoading && services.length === 0 && (
				<p style={{ color: '#757575', marginBottom: 16 }}>
					{__(
						'No services added yet. Add your first service below.',
						'wpappointments'
					)}
				</p>
			)}

			<AddServiceFormWithForm onAdd={handleAdd} />

			<Button
				className={styles.stepButton}
				variant="primary"
				onClick={onSuccess}
				style={{ marginTop: 24 }}
			>
				{__('Continue', 'wpappointments')}
			</Button>
		</div>
	);
}

export default ServicesStep;
