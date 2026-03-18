<?php
/**
 * Bookable type registration helper functions
 *
 * Global convenience functions for registering and querying bookable types.
 * These wrap the BookableTypeRegistry singleton for ease of use.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Bookable;

/**
 * Register a bookable type
 *
 * Should be called on the 'wpappointments_register_bookable_types' action
 * or during 'init'.
 *
 * @param string $slug          Type slug (e.g., 'service', 'table', 'room').
 * @param string $handler_class Fully-qualified handler class name extending AbstractBookableTypeHandler.
 *
 * @return AbstractBookableTypeHandler|\WP_Error
 */
function register_bookable_type( $slug, $handler_class ) {
	return BookableTypeRegistry::get_instance()->register( $slug, $handler_class );
}

/**
 * Get a registered bookable type handler
 *
 * @param string $slug Type slug.
 *
 * @return AbstractBookableTypeHandler|null
 */
function get_bookable_type( $slug ) {
	return BookableTypeRegistry::get_instance()->get( $slug );
}

/**
 * Get all registered bookable types
 *
 * @return array<string, AbstractBookableTypeHandler>
 */
function get_registered_bookable_types() {
	return BookableTypeRegistry::get_instance()->get_all();
}

/**
 * Register a bookable type admin page
 *
 * Adds a submenu page under the WP Appointments menu for managing
 * bookable entities of a specific type.
 *
 * @param string $type_slug Bookable type slug (must match a registered bookable type).
 * @param array  $config    Page configuration: page_title, menu_title, capability, menu_position, icon.
 *
 * @return bool
 */
function register_bookable_type_admin_page( $type_slug, $config ) {
	return BookableAdminPages::get_instance()->register( $type_slug, $config );
}
