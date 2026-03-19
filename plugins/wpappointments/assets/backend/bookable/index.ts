/**
 * Bookable Extension API
 *
 * Main entry point for the bookable extension API. Plugins building
 * bookable type UIs import from this module to access types, hooks,
 * API client functions, and the type registry.
 *
 * @example
 * ```ts
 * import {
 *   registerBookableType,
 *   useBookableEntities,
 *   useBookableVariants,
 *   useEffectiveAvailability,
 *   fetchBookables,
 * } from '~/backend/bookable';
 * ```
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

// Generic List Page (auto-generated from column config)
export { default as BookableListPage } from './BookableListPage';
