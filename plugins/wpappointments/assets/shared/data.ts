/**
 * WP Appointments Data Package
 *
 * Exposed as window.wpappointments.data for addon plugins.
 * Import as @wpappointments/data in addon webpack builds.
 *
 * Contains: store, selectors, actions, resolvers, API clients, types.
 */
// Store
// Fetch utilities
import apiFetch from '~/backend/utils/fetch';
import resolve from '~/backend/utils/resolve';
import { store } from '~/backend/store/store';
import { entitiesApi } from '~/backend/api/entities';
import { serviceCategoriesApi } from '~/backend/api/service-categories';
// API clients
import { servicesApi } from '~/backend/api/services';

// Expose on window
window.wpappointments =
	window.wpappointments || ({} as typeof window.wpappointments);
window.wpappointments.data = {
	store,
	servicesApi,
	serviceCategoriesApi,
	entitiesApi,
	apiFetch,
	resolve,
};
