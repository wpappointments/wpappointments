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
// Hooks utilities
import { applyFilters, doAction } from '~/backend/utils/hooks';
import useFillFormValues from '~/backend/hooks/useFillFormValues';
// Hooks
import useSlideout from '~/backend/hooks/useSlideout';
// Store
import { store } from '~/backend/store/store';
import CardBody from '~/backend/admin/components/CardBody/CardBody';
import { DataViews } from '~/backend/admin/components/DataViews/DataViews';
import { HtmlForm, withForm } from '~/backend/admin/components/Form/Form';
import Input from '~/backend/admin/components/FormField/Input/Input';
import Toggle from '~/backend/admin/components/FormField/Toggle/Toggle';
import FormFieldSet from '~/backend/admin/components/FormFieldSet/FormFieldSet';
import DeleteModal from '~/backend/admin/components/Modals/DeleteModal/DeleteModal';
import SlideOut from '~/backend/admin/components/SlideOut/SlideOut';
import TableFullEmpty from '~/backend/admin/components/TableFullEmpty/TableFullEmpty';
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
