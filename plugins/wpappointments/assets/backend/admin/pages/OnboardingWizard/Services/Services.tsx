import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	FormFieldSet,
	HtmlForm,
	Input,
	withForm,
} from '@wpappointments/components';
import {
	fetchBookables,
	createBookable,
	deleteBookable,
} from '@wpappointments/data';
import type { BookableEntity } from '@wpappointments/data';
import styles from '../OnboardingWizard.module.css';

type ServiceFormData = {
	name: string;
	duration: number;
};

type ServicesProps = {
	onSuccess: () => void;
};

function AddServiceForm({
	onAdd,
}: {
	onAdd: (service: BookableEntity) => void;
}) {
	const onSubmit = async (data: ServiceFormData) => {
		const result = await createBookable({
			name: data.name,
			type: 'service',
			duration: Number(data.duration),
			active: true,
		});

		if (result.data) {
			onAdd(result.data);
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
	const [services, setServices] = useState<BookableEntity[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);

		fetchBookables({ type: 'service' }).then((result) => {
			setServices(result?.data?.bookables || []);
			setIsLoading(false);
		});
	}, []);

	const handleAdd = (service: BookableEntity) => {
		setServices((prev) => [...prev, service]);
	};

	const handleDelete = async (id: number) => {
		await deleteBookable(id);
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
								<td>{(service.duration as number) ?? '—'}</td>
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
