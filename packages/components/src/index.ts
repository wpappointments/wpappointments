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

// DataViews & DataForm (re-exports from @wordpress/dataviews)
export { DataViews, DataForm, useFormValidity } from './DataViews/DataViews';
export type {
	Action,
	DataFormControlProps,
	Field,
	FieldValidity,
	Form,
	FormValidity,
	View,
} from './DataViews/DataViews';

// DataForm Controls (styled Edit components for DataForm fields)
export { default as TextInput } from './DataFormControls/TextInput';
export { default as CheckboxInput } from './DataFormControls/CheckboxInput';
export { default as SelectInput } from './DataFormControls/SelectInput';
export { default as ToggleInput } from './DataFormControls/ToggleInput';
export { default as TextareaInput } from './DataFormControls/TextareaInput';
export { default as RadioInput } from './DataFormControls/RadioInput';
export { default as NumberInput } from './DataFormControls/NumberInput';

// Table
export { default as TableFullEmpty } from './TableFullEmpty/TableFullEmpty';

// SlideOut
export { default as SlideOut } from './SlideOut/SlideOut';
export { default as SlideoutRenderer } from './SlideOut/SlideoutRenderer';

// Toaster
export { default as Toaster } from './Toaster/Toaster';

// Standalone date picker (no form library dependency)
export { default as WPDatePicker } from './FormField/WPDatePicker/WPDatePicker';

// Date Pickers
export { default as MultiDatePicker } from './MultiDatePicker/MultiDatePicker';
export { default as DateRangePicker } from './DateRangePicker/DateRangePicker';

// Action Button
export { default as ActionButton } from './ActionButton/ActionButton';

// ButtonGroup (replaces deprecated @wordpress/components ButtonGroup)
export { default as ButtonGroup } from './ButtonGroup/ButtonGroup';

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
