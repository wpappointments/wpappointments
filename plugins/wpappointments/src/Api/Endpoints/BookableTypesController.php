<?php
/**
 * Bookable types controller (/bookable-types endpoint)
 *
 * Lists registered bookable types with their field schemas.
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
					'callback'            => array( __CLASS__, 'get_types' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::VIEW_BOOKABLES );
					},
				),
			)
		);
	}

	/**
	 * Get all registered bookable types
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_types( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Required by WP REST API callback contract.
		$types    = BookableTypeRegistry::get_instance()->get_all();
		$response = array();

		foreach ( $types as $slug => $handler ) {
			$raw_fields  = $handler->get_fields();
			$fields      = self::serialize_fields( $raw_fields );
			$overridable = $handler->get_variant_overridable_fields();
			$response[]  = array(
				'slug'               => $slug,
				'label'              => $handler->get_label(),
				'fields'             => $fields,
				'variantOverridable' => $overridable,
			);
		}

		return self::response(
			__( 'Bookable types fetched successfully', 'wpappointments' ),
			array( 'types' => $response )
		);
	}

	/**
	 * Serialize field definitions into a flat array with name embedded
	 *
	 * Converts the keyed field array from get_fields() into a sequential
	 * array where each entry includes a 'name' property. Applies defaults
	 * for optional schema properties.
	 *
	 * @param array $raw_fields Keyed field definitions from handler.
	 *
	 * @return array Sequential array of field schemas.
	 */
	private static function serialize_fields( $raw_fields ) {
		$fields = array();

		foreach ( $raw_fields as $name => $config ) {
			$field = array(
				'name'     => $name,
				'type'     => $config['type'] ?? 'text',
				'label'    => $config['label'] ?? $name,
				'default'  => $config['default'] ?? null,
				'required' => $config['required'] ?? false,
			);

			if ( isset( $config['placeholder'] ) && '' !== $config['placeholder'] ) {
				$field['placeholder'] = $config['placeholder'];
			}

			if ( isset( $config['help'] ) && '' !== $config['help'] ) {
				$field['help'] = $config['help'];
			}

			if ( ! empty( $config['options'] ) ) {
				$field['options'] = $config['options'];
			}

			if ( ! empty( $config['validation'] ) ) {
				$field['validation'] = $config['validation'];
			}

			$fields[] = $field;
		}

		return $fields;
	}
}
