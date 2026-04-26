<?php
/**
 * Variants controller (/bookables/{id}/variants endpoint)
 *
 * CRUD endpoints for bookable variants, nested under their parent entity.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_Error;
use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Data\Model\BookableVariant;
use WPAppointments\Data\Query\BookableVariantQuery;

/**
 * Variants endpoint class
 */
class VariantsController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variants' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants/generate',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'generate_variants' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/variants/(?P<variant_id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_variant' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_BOOKABLES );
					},
				),
			)
		);
	}

	/**
	 * Get all variants for a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variants( $request ) {
		$entity_id = absint( $request->get_param( 'entity_id' ) );

		$results  = BookableVariantQuery::by_entity( $entity_id );
		$variants = array_map(
			function ( $post ) {
				$model = new BookableVariant( $post );
				return $model->normalize();
			},
			$results['variants']
		);

		$results['variants'] = $variants;

		return self::response(
			__( 'Variants fetched successfully', 'appointments-booking' ),
			self::paginated( 'variants', $results )
		);
	}

	/**
	 * Create a variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function create_variant( $request ) {
		$entity_id = absint( $request->get_param( 'entity_id' ) );
		$data      = self::sanitize_variant_data( $request->get_json_params() );

		$data['parent_id'] = $entity_id;

		$model = new BookableVariant( $data );
		$saved = $model->save();

		if ( is_wp_error( $saved ) ) {
			return self::error( $saved );
		}

		return self::response(
			__( 'Variant created successfully', 'appointments-booking' ),
			array( 'variant' => $saved->normalize() )
		);
	}

	/**
	 * Generate variants from attribute matrix
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function generate_variants( $request ) {
		$entity_id = absint( $request->get_param( 'entity_id' ) );

		$variants = BookableVariant::generate_from_matrix( $entity_id );

		if ( is_wp_error( $variants ) ) {
			return self::error( $variants );
		}

		$normalized = array_map(
			function ( $variant ) {
				return $variant->normalize();
			},
			$variants
		);

		return self::response(
			__( 'Variants generated successfully', 'appointments-booking' ),
			array( 'variants' => $normalized )
		);
	}

	/**
	 * Get a single variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variant( $request ) {
		$entity_id  = absint( $request->get_param( 'entity_id' ) );
		$variant_id = absint( $request->get_param( 'variant_id' ) );

		$model = new BookableVariant( $variant_id );

		if ( is_wp_error( $model->variant ) ) {
			return self::error( $model->variant );
		}

		if ( $model->variant->post_parent !== $entity_id ) {
			return self::error(
				new WP_Error(
					'rest_invalid_parent',
					__( 'Variant does not belong to the specified bookable entity', 'appointments-booking' ),
					array( 'status' => 404 )
				)
			);
		}

		return self::response(
			__( 'Variant fetched successfully', 'appointments-booking' ),
			array( 'variant' => $model->normalize() )
		);
	}

	/**
	 * Update a variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function update_variant( $request ) {
		$entity_id  = absint( $request->get_param( 'entity_id' ) );
		$variant_id = absint( $request->get_param( 'variant_id' ) );
		$data       = self::sanitize_variant_data( $request->get_json_params() );

		$model = new BookableVariant( $variant_id );

		if ( is_wp_error( $model->variant ) ) {
			return self::error( $model->variant );
		}

		if ( $model->variant->post_parent !== $entity_id ) {
			return self::error(
				new WP_Error(
					'rest_invalid_parent',
					__( 'Variant does not belong to the specified bookable entity', 'appointments-booking' ),
					array( 'status' => 404 )
				)
			);
		}

		$updated = $model->update( $data );

		if ( is_wp_error( $updated ) ) {
			return self::error( $updated );
		}

		return self::response(
			__( 'Variant updated successfully', 'appointments-booking' ),
			array( 'variant' => $updated->normalize() )
		);
	}

	/**
	 * Delete a variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_variant( $request ) {
		$entity_id  = absint( $request->get_param( 'entity_id' ) );
		$variant_id = absint( $request->get_param( 'variant_id' ) );

		$model = new BookableVariant( $variant_id );

		if ( is_wp_error( $model->variant ) ) {
			return self::error( $model->variant );
		}

		if ( $model->variant->post_parent !== $entity_id ) {
			return self::error(
				new WP_Error(
					'rest_invalid_parent',
					__( 'Variant does not belong to the specified bookable entity', 'appointments-booking' ),
					array( 'status' => 404 )
				)
			);
		}

		$deleted = $model->delete();

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'Variant deleted successfully', 'appointments-booking' ),
			array( 'id' => $deleted )
		);
	}

	/**
	 * Sanitize variant data from request JSON body
	 *
	 * @param array $data Raw request data.
	 *
	 * @return array Sanitized data.
	 */
	private static function sanitize_variant_data( $data ) {
		$sanitized = array();

		if ( isset( $data['active'] ) ) {
			$sanitized['active'] = rest_sanitize_boolean( $data['active'] );
		}

		$int_fields = array( 'parent_id', 'duration', 'schedule_id', 'buffer_before', 'buffer_after', 'min_lead_time', 'max_lead_time' );

		foreach ( $int_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				$sanitized[ $field ] = absint( $data[ $field ] );
			}
		}

		if ( isset( $data['attribute_values'] ) && is_array( $data['attribute_values'] ) ) {
			$sanitized['attribute_values'] = array_map( 'sanitize_text_field', $data['attribute_values'] );
		}

		return $sanitized;
	}
}
