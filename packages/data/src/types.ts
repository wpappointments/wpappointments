/**
 * Bookable entity and variant TypeScript types
 *
 * Shared types used by the bookable extension API.
 * Plugins building bookable type UIs should import from here.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

/**
 * Bookable entity as returned by the REST API
 */
export type BookableEntity = {
	id: number;
	name: string;
	active: boolean;
	description: string;
	type: string;
	image: string;
	scheduleId: number;
	bufferBefore: number;
	bufferAfter: number;
	minLeadTime: number;
	maxLeadTime: number;
	duration: number;
	attributes: BookableAttribute[];
	meta: Record<string, unknown>;
	// Type-specific fields are merged at the top level
	[key: string]: unknown;
};

/**
 * Attribute definition on a bookable entity
 */
export type BookableAttribute = {
	name: string;
	values: string[];
};

/**
 * Bookable variant as returned by the REST API
 */
export type BookableVariant = {
	id: number;
	parentId: number;
	name: string;
	active: boolean;
	attributeValues: Record<string, string>;
	overrides: string[];
	duration: number;
	scheduleId: number;
	bufferBefore: number;
	bufferAfter: number;
	minLeadTime: number;
	maxLeadTime: number;
	meta: Record<string, unknown>;
	[key: string]: unknown;
};

/**
 * Availability data format (weekly schedule + date overrides)
 */
export type AvailabilityData = {
	weekly: Record<string, TimeRange[]>;
	overrides: Record<string, TimeRange[]>;
};

/**
 * A time range within a day
 */
export type TimeRange = {
	start: string; // HH:MM format
	end: string; // HH:MM format
};

/**
 * Bookable type field definition (from handler's get_fields())
 */
export type BookableTypeField = {
	/** Field name / meta key */
	name: string;
	/** Field type — determines which control renders in the default form */
	type:
		| 'text'
		| 'select'
		| 'toggle'
		| 'number'
		| 'textarea'
		| 'date'
		| 'custom';
	/** Display label */
	label: string;
	/** Placeholder text (for text/textarea/number) */
	placeholder?: string;
	/** Help text displayed below the field */
	help?: string;
	/** Whether the field is required */
	required?: boolean;
	/** Default value */
	default?: unknown;
	/** Options for select fields */
	options?: Array<{ value: string; label: string }>;
	/** Validation rules */
	validation?: {
		min?: number;
		max?: number;
		minLength?: number;
		maxLength?: number;
	};
};

/**
 * Registered bookable type info (from GET /bookable-types)
 */
export type BookableTypeInfo = {
	slug: string;
	label: string;
	fields: BookableTypeField[];
	variantOverridable: string[];
};

/**
 * Paginated API response wrapper
 */
export type PaginatedResponse<T> = {
	totalItems: number;
	totalPages: number;
	postsPerPage: number;
	currentPage: number;
} & T;

/**
 * Props passed to a custom editComponent by the slideout system
 */
export type BookableEditComponentProps = {
	/** Entity being edited (null = create mode) */
	entity: BookableEntity | null;
	/** Type info including field schemas from PHP */
	typeInfo: BookableTypeInfo;
	/** Submit handler — plugin passes data, core handles REST call + slideout lifecycle */
	onSave: (data: Record<string, unknown>) => Promise<void>;
	/** Cancel handler — closes the slideout */
	onCancel: () => void;
};

/**
 * Props passed to a custom field control in the default form
 */
export type CustomFieldProps = {
	/** Field name (matches meta key) */
	name: string;
	/** Display label */
	label: string;
	/** Current field value */
	value: unknown;
	/** Update the field value */
	onChange: (value: unknown) => void;
	/** Full field definition from PHP schema */
	fieldDef: BookableTypeField;
};

/**
 * Configuration for registering a bookable type on the JS side
 */
export type BookableTypeRegistration = {
	/** Type slug (must match PHP registration) */
	slug: string;
	/** Display label */
	label: string;
	/** React component for the list/management page */
	listComponent?: React.ComponentType;
	/** Custom edit component — replaces default form, rendered inside core slideout */
	editComponent?: React.ComponentType<BookableEditComponentProps>;
	/** Custom column definitions for DataViews */
	columns?: BookableTypeColumn[];
	/** Custom field controls for 'custom' type fields in the default form */
	fieldControls?: Record<string, React.ComponentType<CustomFieldProps>>;
};

/**
 * Column definition for bookable type DataViews
 */
export type BookableTypeColumn = {
	id: string;
	header: string;
	getValue?: (entity: BookableEntity) => unknown;
	render?: React.ComponentType<{ item: BookableEntity }>;
};
