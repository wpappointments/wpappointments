/**
 * Default bookable create/edit form
 *
 * Renders core fields (name, description, active) plus type-specific
 * fields from the PHP field schema. Handles validation, submission,
 * and error display. Used automatically when no editComponent is
 * registered for a bookable type.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import { useState } from 'react';
import {
	Button,
	TextControl,
	TextareaControl,
	SelectControl,
	ToggleControl,
	BaseControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { NumberControl } from '~/backend/utils/experimental';
import { getBookableType } from './registry';
import type {
	BookableEntity,
	BookableTypeInfo,
	BookableTypeField,
	CustomFieldProps,
} from './types';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';

type BookableDefaultFormProps = {
	entity: BookableEntity | null;
	typeInfo: BookableTypeInfo;
	onSave: (data: Record<string, unknown>) => Promise<void>;
	onCancel: () => void;
};

type FormErrors = Record<string, string>;

export default function BookableDefaultForm({
	entity,
	typeInfo,
	onSave,
}: BookableDefaultFormProps) {
	const isEdit = entity !== null;

	// Core field state.
	const [name, setName] = useState(entity?.name ?? '');
	const [description, setDescription] = useState(entity?.description ?? '');
	const [active, setActive] = useState(entity?.active ?? true);

	// Type-specific field state — keyed by field name.
	const [meta, setMeta] = useState<Record<string, unknown>>(() => {
		const initial: Record<string, unknown> = {};
		for (const field of typeInfo.fields) {
			initial[field.name] = entity?.[field.name] ?? field.default ?? '';
		}
		return initial;
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [submitting, setSubmitting] = useState(false);

	const setMetaField = (fieldName: string, value: unknown) => {
		setMeta((prev) => ({ ...prev, [fieldName]: value }));
		// Clear error when field changes.
		if (errors[fieldName]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[fieldName];
				return next;
			});
		}
	};

	const validate = (): FormErrors => {
		const result: FormErrors = {};

		if (!name.trim()) {
			result.name = __('Name is required.', 'wpappointments');
		}

		for (const field of typeInfo.fields) {
			const value = meta[field.name];

			if (
				field.required &&
				(value === '' || value === null || value === undefined)
			) {
				result[field.name] = sprintf(
					/* translators: %s: field label */
					__('%s is required.', 'wpappointments'),
					field.label
				);
				continue;
			}

			if (
				field.validation &&
				value !== '' &&
				value !== null &&
				value !== undefined
			) {
				const numVal = Number(value);

				if (
					field.validation.min !== undefined &&
					numVal < field.validation.min
				) {
					result[field.name] = sprintf(
						/* translators: 1: field label, 2: minimum value */
						__('%1$s must be at least %2$s.', 'wpappointments'),
						field.label,
						String(field.validation.min)
					);
				}

				if (
					field.validation.max !== undefined &&
					numVal > field.validation.max
				) {
					result[field.name] = sprintf(
						/* translators: 1: field label, 2: maximum value */
						__('%1$s must be at most %2$s.', 'wpappointments'),
						field.label,
						String(field.validation.max)
					);
				}

				const strVal = String(value);

				if (
					field.validation.minLength !== undefined &&
					strVal.length < field.validation.minLength
				) {
					result[field.name] = sprintf(
						/* translators: 1: field label, 2: minimum length */
						__(
							'%1$s must be at least %2$s characters.',
							'wpappointments'
						),
						field.label,
						String(field.validation.minLength)
					);
				}

				if (
					field.validation.maxLength !== undefined &&
					strVal.length > field.validation.maxLength
				) {
					result[field.name] = sprintf(
						/* translators: 1: field label, 2: maximum length */
						__(
							'%1$s must be at most %2$s characters.',
							'wpappointments'
						),
						field.label,
						String(field.validation.maxLength)
					);
				}
			}
		}

		return result;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setSubmitting(true);

		await onSave({
			name,
			description,
			active,
			...meta,
		});

		setSubmitting(false);
	};

	return (
		<form onSubmit={handleSubmit}>
			<FormFieldSet>
				{/* Core fields */}
				<TextControl
					label={__('Name', 'wpappointments')}
					value={name}
					onChange={(val: string) => {
						setName(val);
						if (errors.name) {
							setErrors((prev) => {
								const next = { ...prev };
								delete next.name;
								return next;
							});
						}
					}}
					required
					help={errors.name}
					__nextHasNoMarginBottom
				/>

				<TextareaControl
					label={__('Description', 'wpappointments')}
					value={description}
					onChange={setDescription}
					__nextHasNoMarginBottom
				/>

				<ToggleControl
					label={__('Active', 'wpappointments')}
					checked={active}
					onChange={setActive}
					__nextHasNoMarginBottom
				/>

				{/* Type-specific fields */}
				{typeInfo.fields.map((field) => (
					<FieldControl
						key={field.name}
						field={field}
						value={meta[field.name]}
						onChange={(val) => setMetaField(field.name, val)}
						error={errors[field.name]}
						typeSlug={typeInfo.slug}
					/>
				))}
			</FormFieldSet>

			<Button
				variant="primary"
				type="submit"
				isBusy={submitting}
				disabled={submitting}
				style={{
					width: '100%',
					justifyContent: 'center',
					padding: '22px 0px',
					marginTop: '34px',
				}}
			>
				{isEdit
					? __('Update', 'wpappointments')
					: __('Create', 'wpappointments')}
			</Button>
		</form>
	);
}

/**
 * Renders the appropriate WP control for a field schema entry
 */
function FieldControl({
	field,
	value,
	onChange,
	error,
	typeSlug,
}: {
	field: BookableTypeField;
	value: unknown;
	onChange: (value: unknown) => void;
	error?: string;
	typeSlug: string;
}) {
	const helpText = error || field.help;

	switch (field.type) {
		case 'text':
			return (
				<TextControl
					label={field.label}
					value={String(value ?? '')}
					onChange={onChange}
					placeholder={field.placeholder}
					required={field.required}
					help={helpText}
					__nextHasNoMarginBottom
				/>
			);

		case 'textarea':
			return (
				<TextareaControl
					label={field.label}
					value={String(value ?? '')}
					onChange={onChange}
					placeholder={field.placeholder}
					required={field.required}
					help={helpText}
					__nextHasNoMarginBottom
				/>
			);

		case 'number':
			return (
				<NumberControl
					label={field.label}
					value={value as number}
					onChange={(val: string | undefined) => {
						onChange(val !== undefined ? Number(val) : '');
					}}
					min={field.validation?.min}
					max={field.validation?.max}
					required={field.required}
					help={helpText}
				/>
			);

		case 'select':
			return (
				<SelectControl
					label={field.label}
					value={String(value ?? '')}
					onChange={onChange}
					options={[
						...(field.required
							? []
							: [
									{
										value: '',
										label: __(
											'— Select —',
											'wpappointments'
										),
									},
								]),
						...(field.options ?? []),
					]}
					help={helpText}
					__nextHasNoMarginBottom
				/>
			);

		case 'toggle':
			return (
				<BaseControl help={helpText} __nextHasNoMarginBottom>
					<ToggleControl
						label={field.label}
						checked={Boolean(value)}
						onChange={onChange}
						__nextHasNoMarginBottom
					/>
				</BaseControl>
			);

		case 'custom': {
			const registration = getBookableType(typeSlug);
			const CustomControl = registration?.fieldControls?.[field.name];

			if (!CustomControl) {
				// eslint-disable-next-line no-console
				console.warn(
					`[WP Appointments] No fieldControl registered for custom field "${field.name}" on type "${typeSlug}". Skipping.`
				);
				return null;
			}

			const customProps: CustomFieldProps = {
				name: field.name,
				label: field.label,
				value,
				onChange,
				fieldDef: field,
			};

			return <CustomControl {...customProps} />;
		}

		default:
			return (
				<TextControl
					label={field.label}
					value={String(value ?? '')}
					onChange={onChange}
					help={helpText}
					__nextHasNoMarginBottom
				/>
			);
	}
}
