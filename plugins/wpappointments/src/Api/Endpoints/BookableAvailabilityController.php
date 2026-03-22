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
use WPAppointments\Data\Model\BookableEntity;
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
		$variant_id = absint( $request->get_param( 'variant_id' ) );

		$date_range = array(
			'start' => sanitize_text_field( $request->get_param( 'start_date' ) ?? '' ),
			'end'   => sanitize_text_field( $request->get_param( 'end_date' ) ?? '' ),
		);

		$availability = AvailabilityEngine::get_effective_availability( $variant_id, $date_range );
		$buffers      = self::get_effective_buffers( $variant_id );

		return self::response(
			__( 'Availability fetched successfully', 'wpappointments' ),
			array(
				'availability' => $availability,
				'buffers'      => $buffers,
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
	public static function get_entity_availability( $request ) {
		$entity_id = absint( $request->get_param( 'entity_id' ) );

		$date_range = array(
			'start' => sanitize_text_field( $request->get_param( 'start_date' ) ?? '' ),
			'end'   => sanitize_text_field( $request->get_param( 'end_date' ) ?? '' ),
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

	/**
	 * Get effective buffer times for a variant
	 *
	 * Returns the variant's buffer values if set, otherwise falls back
	 * to the global default buffer settings.
	 *
	 * @param int $variant_id Variant post ID.
	 *
	 * @return array{before: int, after: int}
	 */
	private static function get_effective_buffers( $variant_id ) {
		$global_before = (int) get_option( 'wpappointments_appointments_defaultBufferBefore', 0 );
		$global_after  = (int) get_option( 'wpappointments_appointments_defaultBufferAfter', 0 );

		$variant_post = get_post( $variant_id );

		if ( ! $variant_post ) {
			return array(
				'before' => $global_before,
				'after'  => $global_after,
			);
		}

		$model     = new BookableVariant( $variant_post );
		$normalize = $model->normalize();

		$before = ( $normalize['bufferBefore'] ?? 0 ) > 0 ? (int) $normalize['bufferBefore'] : $global_before;
		$after  = ( $normalize['bufferAfter'] ?? 0 ) > 0 ? (int) $normalize['bufferAfter'] : $global_after;

		return array(
			'before' => $before,
			'after'  => $after,
		);
	}
}
