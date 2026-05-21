/**
 * WP Appointments Shared Components & Utilities
 *
 * This script exposes core UI components, hooks, and utilities
 * to addon plugins via window.wpappointments.components.
 *
 * Addon plugins should declare 'wpappointments-shared-js' as a
 * script dependency and access:
 *   const { DataViews, SlideOut, useSlideout } = window.wpappointments.components;
 */
// Components
import {
	CardBody,
	DataForm,
	DataViews,
	FormFieldSet,
	DeleteModal,
	SlideOut,
	TableFullEmpty,
	TextInput,
	SelectInput,
	ToggleInput,
	CheckboxInput,
	NumberInput,
	TextareaInput,
	RadioInput,
	useFormValidity,
} from '@wpappointments/components';
// Hooks & utilities
import { useSlideout } from '@wpappointments/data';
import { applyFilters, doAction } from '~/backend/utils/hooks';
// Store
import { store } from '~/backend/store/store';
// State context
import {
	StateContextProvider,
	useStateContext,
} from '~/backend/admin/context/StateContext';
import LayoutDefault from '~/backend/admin/layouts/LayoutDefault/LayoutDefault';

// Expose on window for addon plugins
window.wpappointments =
	window.wpappointments || ({} as typeof window.wpappointments);
window.wpappointments.components = {
	DataViews,
	DataForm,
	SlideOut,
	CardBody,
	DeleteModal,
	TableFullEmpty,
	FormFieldSet,
	TextInput,
	SelectInput,
	ToggleInput,
	CheckboxInput,
	NumberInput,
	TextareaInput,
	RadioInput,
	useFormValidity,
	LayoutDefault,
	useSlideout,
	store,
	applyFilters,
	doAction,
	StateContextProvider,
	useStateContext,
};
