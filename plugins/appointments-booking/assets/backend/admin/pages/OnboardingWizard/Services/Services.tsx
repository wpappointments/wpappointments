import { useEffect, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	DataForm,
	FormFieldSet,
	NumberInput,
	TextInput,
	useFormValidity,
} from '@wpappointments/components';
import type { Field, Form } from '@wpappointments/components';
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

const emptyService: ServiceFormData = {
	name: '',
	duration: 30,
};

const fields: Field<ServiceFormData>[] = [
	{
		id: 'name',
		type: 'text',
		label: __('Service name', 'appointments-booking'),
		placeholder: __('e.g. Consultation', 'appointments-booking'),
		isValid: { required: true },
		Edit: TextInput,
	},
	{
		id: 'duration',
		type: 'integer',
		label: __('Duration (minutes)', 'appointments-booking'),
		isValid: { required: true, min: 1 },
		Edit: NumberInput,
	},
];

const formConfig: Form = {
	layout: { type: 'regular' },
	fields: ['name', 'duration'],
};

function AddServiceForm({
	onAdd,
}: {
	onAdd: (service: BookableEntity) => void;
}) {
	const [formData, setFormData] = useState<ServiceFormData>({
		...emptyService,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { validity, isValid } = useFormValidity(formData, fields, formConfig);

	const onSubmit = async () => {
		if (!isValid || isSubmitting) {
			return;
		}
		setIsSubmitting(true);

		try {
			const result = await createBookable({
				name: formData.name,
				type: 'service',
				duration: Number(formData.duration),
				active: true,
			});

			if (result.data) {
				onAdd(result.data);
				setFormData({ ...emptyService });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
		>
			<FormFieldSet style={{ marginBottom: 16 }}>
				<DataForm
					data={formData}
					fields={fields}
					form={formConfig}
					onChange={(edits) =>
						setFormData((prev) => ({ ...prev, ...edits }))
					}
					validity={validity}
				/>
			</FormFieldSet>
			<Button
				type="submit"
				variant="secondary"
				disabled={!isValid || isSubmitting}
			>
				{__('Add Service', 'appointments-booking')}
			</Button>
		</form>
	);
}

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
		const result = await deleteBookable(id);

		if (!result.error) {
			setServices((prev) => prev.filter((s) => s.id !== id));
		}
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
							<th>{__('Name', 'appointments-booking')}</th>
							<th style={{ width: 120 }}>
								{__('Duration (min)', 'appointments-booking')}
							</th>
							<th style={{ width: 80 }}>
								{__('Remove', 'appointments-booking')}
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
										{__('Remove', 'appointments-booking')}
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
						'appointments-booking'
					)}
				</p>
			)}

			<AddServiceForm onAdd={handleAdd} />

			<Button
				className={styles.stepButton}
				variant="primary"
				onClick={onSuccess}
				style={{ marginTop: 24 }}
			>
				{__('Continue', 'appointments-booking')}
			</Button>
		</div>
	);
}

export default ServicesStep;
