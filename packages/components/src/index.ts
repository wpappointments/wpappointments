/**
 * @wpappointments/components
 *
 * UI components for WP Appointments plugin extensions.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

// Admin UI building blocks
export { default as CardBody } from './CardBody/CardBody';
export { DataViews } from './DataViews/DataViews';
export type {
	View,
	Field,
	Action,
	PaginationInfo,
	CollectionItem,
} from './DataViews/types';
export { default as TableFullEmpty } from './TableFullEmpty/TableFullEmpty';
export { default as FormFieldSet } from './FormFieldSet/FormFieldSet';
export { default as FormField, formFieldStyles } from './FormField/FormField';

// Bookable CRUD components
export { default as BookableListPage } from './BookableListPage';
export { default as BookableDefaultForm } from './BookableDefaultForm';
export { default as BookableSlideoutContent } from './BookableSlideoutContent';
