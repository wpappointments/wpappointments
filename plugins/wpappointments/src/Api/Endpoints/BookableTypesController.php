<?php
/**
 * Bookable types controller (/bookable-types endpoint)
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Bookable\BookableTypeRegistry;
use WPAppointments\Data\Model\BookableVariant;

/**
 * Bookable types endpoint class
 */
class BookableTypesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookable-types',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_types' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);
	}

	/**
	 * Get all registered bookable types with their field schemas
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all_types( WP_REST_Request $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		$registry = BookableTypeRegistry::get_instance();
		$types    = array();

		foreach ( $registry->get_all() as $slug => $handler ) {
			$types[] = array(
				'slug'                     => $slug,
				'label'                    => $handler->get_label(),
				'fields'                   => $handler->get_fields(),
				'variantOverridableFields' => array_merge(
					BookableVariant::OVERRIDABLE_CORE_FIELDS,
					$handler->get_variant_overridable_fields()
				),
			);
		}

		return self::response(
			__( 'Bookable types fetched successfully', 'wpappointments' ),
			array(
				'types' => $types,
			)
		);
	}
}
