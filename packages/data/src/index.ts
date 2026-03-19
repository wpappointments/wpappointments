/**
 * @wpappointments/data
 *
 * Hooks, API functions, utilities, and type registry for
 * WP Appointments plugin extensions.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

// Types
export type {
	BookableEntity,
	BookableAttribute,
	BookableVariant,
	AvailabilityData,
	TimeRange,
	BookableTypeField,
	BookableTypeInfo,
	BookableEditComponentProps,
	CustomFieldProps,
	PaginatedResponse,
	BookableTypeRegistration,
	BookableTypeColumn,
} from './types';

// React Hooks
export {
	useBookableEntities,
	useBookableVariants,
	useEffectiveAvailability,
	useBookableEntity,
} from './hooks';

// Slideout Hook
export { default as useSlideout } from './useSlideout';
export type { OpenSlideOutOptions } from './useSlideout';

// API Client
export {
	fetchBookables,
	fetchBookable,
	createBookable,
	updateBookable,
	deleteBookable,
	fetchVariants,
	fetchVariant,
	createVariant,
	updateVariant,
	deleteVariant,
	generateVariants,
	fetchVariantAvailability,
	fetchEntityAvailability,
	fetchBookableTypes,
} from './api';

// JS-side Type Registry
export {
	registerBookableType,
	getBookableType,
	getRegisteredBookableTypes,
	hasBookableType,
} from './registry';

// Toast Utilities
export { displaySuccessToast, displayErrorToast } from './toast';

// Fetch Utility
export { default as apiFetch } from './fetch';
export type { APIResponse } from './fetch';

// Slideout Content (for SlideoutRenderer in core)
export {
	getSlideoutContent,
	setSlideoutContent,
	removeSlideoutContent,
} from './slideout-content';
export type { SlideoutContent } from './slideout-content';
