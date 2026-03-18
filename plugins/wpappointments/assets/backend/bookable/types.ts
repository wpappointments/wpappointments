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
	default: unknown;
};

/**
 * Registered bookable type info (from GET /bookable-types)
 */
export type BookableTypeInfo = {
	slug: string;
	label: string;
	fields: Record<string, BookableTypeField>;
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
 * Configuration for registering a bookable type on the JS side
 */
export type BookableTypeRegistration = {
	/** Type slug (must match PHP registration) */
	slug: string;
	/** Display label */
	label: string;
	/** React component for the list/management page */
	listComponent?: React.ComponentType;
	/** React component for the edit form */
	editComponent?: React.ComponentType<{ entity: BookableEntity }>;
	/** Custom column definitions for DataViews */
	columns?: BookableTypeColumn[];
	/** Custom field renderers for the edit form */
	fieldRenderers?: Record<
		string,
		React.ComponentType<{
			value: unknown;
			onChange: (value: unknown) => void;
		}>
	>;
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
