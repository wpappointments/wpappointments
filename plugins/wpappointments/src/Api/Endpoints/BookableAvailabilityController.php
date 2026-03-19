<?php
/**
 * Bookable availability controller (/availability endpoint)
 *
 * @package WPAppointments
 * @since 0.4.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WP_Error;
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
	public static function get_variant_availability( WP_REST_Request $request ) {
		$variant_id = (int) $request->get_param( 'variant_id' );
		$start_date = $request->get_param( 'start_date' );
		$end_date   = $request->get_param( 'end_date' );

		$variant = new BookableVariant( $variant_id );

		if ( is_wp_error( $variant->variant ) ) {
			return self::error( $variant->variant );
		}

		$date_range = array();

		if ( $start_date ) {
			$date_range['start'] = sanitize_text_field( $start_date );
		}

		if ( $end_date ) {
			$date_range['end'] = sanitize_text_field( $end_date );
		}

		$availability = AvailabilityEngine::get_effective_availability( $variant_id, $date_range );

		return self::response(
			__( 'Availability fetched successfully', 'wpappointments' ),
			array(
				'variantId'    => $variant_id,
				'availability' => $availability,
			)
		);
	}

	/**
	 * Get availability for all variants of a bookable entity
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_entity_availability( WP_REST_Request $request ) {
		$entity_id  = (int) $request->get_param( 'entity_id' );
		$start_date = $request->get_param( 'start_date' );
		$end_date   = $request->get_param( 'end_date' );

		$date_range = array();

		if ( $start_date ) {
			$date_range['start'] = sanitize_text_field( $start_date );
		}

		if ( $end_date ) {
			$date_range['end'] = sanitize_text_field( $end_date );
		}

		$results  = BookableVariantQuery::active( $entity_id );
		$variants = array();

		foreach ( $results['variants'] as $variant_post ) {
			$variant      = new BookableVariant( $variant_post );
			$availability = AvailabilityEngine::get_effective_availability( $variant_post->ID, $date_range );

			$variants[] = array(
				'variant'      => $variant->normalize(),
				'availability' => $availability,
			);
		}

		return self::response(
			__( 'Entity availability fetched successfully', 'wpappointments' ),
			array(
				'entityId' => $entity_id,
				'variants' => $variants,
			)
		);
	}
}
