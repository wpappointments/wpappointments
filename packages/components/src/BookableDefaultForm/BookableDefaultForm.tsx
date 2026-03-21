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
import BookableField from '../BookableField/BookableField';
import FieldMessages from '../FieldMessages/FieldMessages';
import FormField, { formFieldStyles } from '../FormField/FormField';
import FormFieldSet from '../FormFieldSet/FormFieldSet';

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

			// Skip validation for unregistered custom fields
			if (
				field.type === 'custom' &&
				!getBookableType(typeInfo.slug)?.fieldControls?.[field.name]
			) {
				continue;
			}

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
					<FieldMessages error={errors.name} />
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

type FieldControlProps = {
	field: BookableTypeField;
	value: unknown;
	onChange: (value: unknown) => void;
	error?: string;
	typeSlug: string;
};

function TextField({ field, value, onChange, error }: FieldControlProps) {
	return (
		<BookableField field={field} error={error}>
			<InputControl
				placeholder={field.placeholder}
				onChange={onChange}
				value={String(value ?? '')}
				size="__unstable-large"
			/>
		</BookableField>
	);
}

function TextareaField({ field, value, onChange, error }: FieldControlProps) {
	return (
		<BookableField field={field} error={error}>
			<TextareaControl
				value={String(value ?? '')}
				onChange={onChange}
				placeholder={field.placeholder}
				__nextHasNoMarginBottom
			/>
		</BookableField>
	);
}

function NumberField({ field, value, onChange, error }: FieldControlProps) {
	return (
		<BookableField field={field} error={error}>
			<NumberControl
				value={value as number}
				onChange={(val: string | undefined) => {
					onChange(
						val !== undefined && val !== ''
							? Number(val)
							: undefined
					);
				}}
				min={field.validation?.min}
				max={field.validation?.max}
				size="__unstable-large"
			/>
		</BookableField>
	);
}

function SelectField({ field, value, onChange, error }: FieldControlProps) {
	return (
		<BookableField field={field} error={error}>
			<SelectControl
				value={String(value ?? '')}
				onChange={onChange}
				options={[
					...(field.required
						? []
						: [
								{
									value: '',
									label: __('— Select —', 'wpappointments'),
								},
							]),
					...(field.options ?? []),
				]}
				size="__unstable-large"
				__nextHasNoMarginBottom
			/>
		</BookableField>
	);
}

function ToggleField({ field, value, onChange, error }: FieldControlProps) {
	return (
		<BookableField field={field} error={error} showLabel={false}>
			<ToggleControl
				label={field.label}
				checked={Boolean(value)}
				onChange={onChange}
				__nextHasNoMarginBottom
			/>
		</BookableField>
	);
}

function CustomField({ field, value, onChange, typeSlug }: FieldControlProps) {
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

const fieldComponentMap = new Map<
	string,
	React.ComponentType<FieldControlProps>
>([
	['text', TextField],
	['textarea', TextareaField],
	['number', NumberField],
	['select', SelectField],
	['toggle', ToggleField],
	['custom', CustomField],
]);

function FieldControl(props: FieldControlProps) {
	const Component = fieldComponentMap.get(props.field.type) ?? TextField;
	return <Component {...props} />;
}
