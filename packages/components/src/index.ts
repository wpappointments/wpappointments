/**
 * @wpappointments/components
 *
 * UI components for WP Appointments plugin extensions.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

// Layout / Container
export { default as CardBody } from './CardBody/CardBody';
export { default as FormFieldSet } from './FormFieldSet/FormFieldSet';
export { default as FormField, formFieldStyles } from './FormField/FormField';
export { default as ErrorMessage } from './ErrorMessage/ErrorMessage';

// DataViews
export { DataViews } from './DataViews/DataViews';
export type {
	View,
	Field,
	Action,
	PaginationInfo,
	CollectionItem,
} from './DataViews/types';

// Table
export { default as TableFullEmpty } from './TableFullEmpty/TableFullEmpty';

// SlideOut
export { default as SlideOut } from './SlideOut/SlideOut';
export { default as SlideoutRenderer } from './SlideOut/SlideoutRenderer';

// Toaster
export { default as Toaster } from './Toaster/Toaster';

// Form (React Hook Form wrappers)
export { HtmlForm, FormProvider, withForm } from './Form/Form';

// Form Fields (React Hook Form controlled)
export { default as Input } from './FormField/Input/Input';
export { default as Select } from './FormField/Select/Select';
export { default as Toggle } from './FormField/Toggle/Toggle';
export { default as NumberField } from './FormField/Number/Number';
export { default as Checkbox } from './FormField/Checkbox/Checkbox';
export { default as Radio } from './FormField/Radio/Radio';
export { default as DatePicker } from './FormField/DatePicker/DatePicker';
export { default as WPDatePicker } from './FormField/WPDatePicker/WPDatePicker';

// Form Utilities
export { getGenericInputErrorMessage } from './utils/forms';
export type { FormFieldError } from './utils/forms';

// MultiDatePicker
export { default as MultiDatePicker } from './MultiDatePicker/MultiDatePicker';

// Action Button
export { default as ActionButton } from './ActionButton/ActionButton';

// Modals
export { default as DeleteModal } from './DeleteModal/DeleteModal';

// SlotFill
export { HeaderActionsSlot, HeaderActionsFill } from './SlotFill/HeaderActions';
export {
	SlideoutHeaderActionsSlot,
	SlideoutHeaderActionsFill,
} from './SlotFill/SlideoutHeaderActions';

// Bookable CRUD components
export { default as BookableListPage } from './BookableListPage/BookableListPage';
export { default as BookableDefaultForm } from './BookableDefaultForm/BookableDefaultForm';
export { default as BookableField } from './BookableField/BookableField';
export { default as FieldMessages } from './FieldMessages/FieldMessages';
export { default as BookableSlideoutContent } from './BookableSlideoutContent/BookableSlideoutContent';
