<?php
/**
 * Bookable availability controller
 *
 * Endpoints for querying effective availability for bookable variants.
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Core\Capabilities;
use WPAppointments\Availability\AvailabilityEngine;
use WPAppointments\Data\Model\BookableVariant;
use WPAppointments\Data\Query\BookableVariantQuery;

/**
 * Bookable availability endpoint class
 */
class BookableAvailabilityController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/bookable-availability/(?P<variant_id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_variant_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/bookables/(?P<entity_id>\d+)/availability',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_entity_availability' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get effective availability for a variant
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_variant_availability( $request ) {
		$variant_id = (int) $request->get_param( 'variant_id' );

		$date_range = array(
			'start' => $request->get_param( 'start_date' ) ?? '',
			'end'   => $request->get_param( 'end_date' ) ?? '',
		);

		$availability = AvailabilityEngine::get_effective_availability( $variant_id, $date_range );

		return self::response(
			__( 'Availability fetched successfully', 'wpappointments' ),
			array( 'availability' => $availability )
		);
	}

	/**
	 * Get availability for all variants of a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity_availability( $request ) {
		$entity_id = (int) $request->get_param( 'entity_id' );

		$date_range = array(
			'start' => $request->get_param( 'start_date' ) ?? '',
			'end'   => $request->get_param( 'end_date' ) ?? '',
		);

		$result   = BookableVariantQuery::by_entity( $entity_id );
		$variants = array();

		foreach ( $result['variants'] as $variant_post ) {
			$model        = new BookableVariant( $variant_post );
			$availability = AvailabilityEngine::get_effective_availability( $variant_post->ID, $date_range );

			$variants[] = array(
				'variant'      => $model->normalize(),
				'availability' => $availability,
			);
		}

		return self::response(
			__( 'Entity availability fetched successfully', 'wpappointments' ),
			array( 'variants' => $variants )
		);
	}
}
