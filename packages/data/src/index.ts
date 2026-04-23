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
	useSlideout,
} from './hooks';
export type { OpenSlideOutOptions } from './hooks';

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

// Utilities
export { displaySuccessToast, displayErrorToast, apiFetch } from './utils';
export type { APIResponse } from './utils';

// Slideout Content
export {
	getSlideoutContent,
	setSlideoutContent,
	removeSlideoutContent,
} from './utils';
export type { SlideoutContent } from './utils';
