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
	SelectControl,
	ToggleControl,
	TextareaControl,
} from '@wordpress/components';
import {
	__experimentalInputControl as InputControl,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getBookableType } from '@wpappointments/data';
import type {
	BookableEntity,
	BookableTypeInfo,
	BookableTypeField,
	CustomFieldProps,
} from '@wpappointments/data';
import FormField, { formFieldStyles } from './FormField/FormField';
import FormFieldSet from './FormFieldSet/FormFieldSet';

type BookableDefaultFormProps = {
	entity: BookableEntity | null;
	typeInfo: BookableTypeInfo;
	onSave: (data: Record<string, unknown>) => Promise<void>;
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
		if (errors[fieldName]) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next[fieldName];
				return next;
			});
		}
	};

	const clearNameError = () => {
		if (errors.name) {
			setErrors((prev) => {
				const next = { ...prev };
				delete next.name;
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

		try {
			await onSave({
				name,
				description,
				active,
				...meta,
			});
		} catch (err) {
			// Let the caller handle the error; just ensure UI resets.
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<FormFieldSet>
				{/* Core fields */}
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{__('Name', 'wpappointments')}*
					</label>
					<InputControl
						value={name}
						onChange={(val: string | undefined) => {
							setName(val ?? '');
							clearNameError();
						}}
						size="__unstable-large"
					/>
					{errors.name && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: 'red',
							}}
						>
							{errors.name}
						</p>
					)}
				</FormField>

				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{__('Description', 'wpappointments')}
					</label>
					<TextareaControl
						value={description}
						onChange={setDescription}
						__nextHasNoMarginBottom
					/>
				</FormField>

				<FormField>
					<ToggleControl
						label={__('Active', 'wpappointments')}
						checked={active}
						onChange={setActive}
						__nextHasNoMarginBottom
					/>
				</FormField>

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
 * Renders the appropriate WP control for a field schema entry,
 * using the same FormField wrapper and styling as the rest of the app.
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
	switch (field.type) {
		case 'text':
			return (
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{field.label}
						{field.required && '*'}
					</label>
					<InputControl
						placeholder={field.placeholder}
						onChange={onChange}
						value={String(value ?? '')}
						size="__unstable-large"
					/>
					{(error || field.help) && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: error ? 'red' : undefined,
							}}
						>
							{error || field.help}
						</p>
					)}
				</FormField>
			);

		case 'textarea':
			return (
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{field.label}
						{field.required && '*'}
					</label>
					<TextareaControl
						value={String(value ?? '')}
						onChange={onChange}
						placeholder={field.placeholder}
						__nextHasNoMarginBottom
					/>
					{error && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: 'red',
							}}
						>
							{error}
						</p>
					)}
				</FormField>
			);

		case 'number':
			return (
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{field.label}
						{field.required && '*'}
					</label>
					<NumberControl
						value={value as number}
						onChange={(val: string | undefined) => {
							onChange(
								val !== undefined ? Number(val) : undefined
							);
						}}
						min={field.validation?.min}
						max={field.validation?.max}
						size="__unstable-large"
					/>
					{(error || field.help) && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: error ? 'red' : undefined,
							}}
						>
							{error || field.help}
						</p>
					)}
				</FormField>
			);

		case 'select':
			return (
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{field.label}
						{field.required && '*'}
					</label>
					<SelectControl
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
						size="__unstable-large"
						__nextHasNoMarginBottom
					/>
					{(error || field.help) && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: error ? 'red' : undefined,
							}}
						>
							{error || field.help}
						</p>
					)}
				</FormField>
			);

		case 'toggle':
			return (
				<FormField>
					<ToggleControl
						label={field.label}
						checked={Boolean(value)}
						onChange={onChange}
						__nextHasNoMarginBottom
					/>
					{(error || field.help) && (
						<p
							style={{
								marginTop: 0,
								marginBottom: 0,
								color: error ? 'red' : undefined,
								fontSize: '12px',
							}}
						>
							{error || field.help}
						</p>
					)}
				</FormField>
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
				<FormField>
					<label className={formFieldStyles.fieldLabel}>
						{field.label}
					</label>
					<InputControl
						onChange={onChange}
						value={String(value ?? '')}
						size="__unstable-large"
					/>
				</FormField>
			);
	}
}
