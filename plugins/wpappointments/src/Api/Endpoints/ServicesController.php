<?php
/**
 * Services controller (/services endpoint)
 *
 * @package WPAppointments
 * @since 0.2.0
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Data\Model\Service;
use WPAppointments\Data\Query\ServicesQuery;
use WPAppointments\Core\Capabilities;

/**
 * Services endpoint class
 */
class ServicesController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/services',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_services' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SERVICES );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_service' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SERVICES );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/services/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_service' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SERVICES );
					},
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_service' ),
					'permission_callback' => function () {
						return current_user_can( Capabilities::MANAGE_SERVICES );
					},
				),
			)
		);
	}

	/**
	 * Get all services
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_services() {
		$results = ServicesQuery::all();

		return self::response(
			__( 'Services fetched successfully', 'wpappointments' ),
			array(
				'services' => array_map(
					function ( $service_post ) {
						$service = new Service( $service_post );
						return $service->normalize();
					},
					$results['services']
				),
				'total'    => $results['total'],
			)
		);
	}

	/**
	 * Create service
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_service( WP_REST_Request $request ) {
		$data    = $request->get_json_params();
		$service = new Service( $data );
		$result  = $service->save();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Service created successfully', 'wpappointments' ),
			array(
				'service' => $result->normalize(),
			)
		);
	}

	/**
	 * Update service
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update_service( WP_REST_Request $request ) {
		$id   = $request->get_param( 'id' );
		$data = $request->get_json_params();

		$service = new Service( (int) $id );
		$result  = $service->update( $data );

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Service updated successfully', 'wpappointments' ),
			array(
				'service' => $result->normalize(),
			)
		);
	}

	/**
	 * Delete service
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function delete_service( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$service = new Service( (int) $id );
		$result  = $service->delete();

		if ( is_wp_error( $result ) ) {
			return self::error( $result );
		}

		return self::response(
			__( 'Service deleted successfully', 'wpappointments' ),
			array(
				'serviceId' => $id,
			)
		);
	}
}
