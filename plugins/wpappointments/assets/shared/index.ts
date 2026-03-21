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
	DataViews,
	HtmlForm,
	withForm,
	Input,
	Toggle,
	FormFieldSet,
	DeleteModal,
	SlideOut,
	TableFullEmpty,
} from '@wpappointments/components';
// Hooks & utilities
import { useSlideout } from '@wpappointments/data';
import { applyFilters, doAction } from '~/backend/utils/hooks';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
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
	SlideOut,
	CardBody,
	DeleteModal,
	TableFullEmpty,
	HtmlForm,
	withForm,
	Input,
	Toggle,
	FormFieldSet,
	LayoutDefault,
	useSlideout,
	useFillFormValues,
	store,
	applyFilters,
	doAction,
	StateContextProvider,
	useStateContext,
};
