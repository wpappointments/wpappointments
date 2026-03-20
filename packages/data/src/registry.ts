/**
 * Bookable type registry (JS side)
 *
 * Mirrors the PHP BookableTypeRegistry. Plugins register their bookable
 * type's UI components here so the admin can dynamically render the
 * correct page, form, and columns for each type.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import type { BookableTypeRegistration } from './types';

const registeredTypes = new Map<string, BookableTypeRegistration>();

/**
 * Register a bookable type on the JS side
 *
 * Call this from your plugin's JS entry point to register UI components
 * for a bookable type. The slug must match the PHP registration.
 *
 * @example
 * ```ts
 * import { registerBookableType } from '@wpappointments/bookable';
 *
 * registerBookableType({
 *   slug: 'service',
 *   label: 'Services',
 *   listComponent: ServiceListPage,
 *   editComponent: ServiceEditForm,
 *   columns: [
 *     { id: 'duration', header: 'Duration', getValue: (e) => e.duration },
 *     { id: 'price', header: 'Price', getValue: (e) => e.price },
 *   ],
 * });
 * ```
 */
export function registerBookableType(config: BookableTypeRegistration): void {
	if (registeredTypes.has(config.slug)) {
		// eslint-disable-next-line no-console
		console.warn(
			`[WP Appointments] Bookable type "${config.slug}" is already registered on the JS side.`
		);
		return;
	}

	registeredTypes.set(config.slug, config);
}

/**
 * Get a registered bookable type's JS configuration
 */
export function getBookableType(
	slug: string
): BookableTypeRegistration | undefined {
	return registeredTypes.get(slug);
}

/**
 * Get all registered bookable types (JS side)
 */
export function getRegisteredBookableTypes(): Map<
	string,
	BookableTypeRegistration
> {
	return new Map(registeredTypes);
}

/**
 * Check if a bookable type is registered on the JS side
 */
export function hasBookableType(slug: string): boolean {
	return registeredTypes.has(slug);
}
