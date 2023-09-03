<?php
/**
 * Main WP Appointments rest API controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api;

use WP_REST_Response;
use WP_Error;

/**
 * Endpoint controller
 */
class Controller {
	const ROUTE_NAMESPACE = 'wpappointments/v1';

	/**
	 * Init method stub
	 *
	 * @return WP_Error
	 */
	public static function init() {
		return new WP_Error(
			'invalid-method',
			sprintf(
				"Method '%s' not implemented. Must be overridden in subclass.",
				__METHOD__
			),
			array( 'status' => 405 )
		);
	}

	/**
	 * Create normalized error response
	 *
	 * @param string $message    Error message.
	 * @param arr    $data       Hash with additional data. Status is added automatically.
	 * @param int    $status     HTTP status.
	 *
	 * @return WP_REST_Response
	 */
	public static function error( $message = '', $data = array(), $status = 422 ) {
		$data['status'] = $status;

		$response = array(
			'type'    => 'error',
			'message' => $message,
			'data'    => $data,
		);

		$response = new WP_REST_Response( $response );
		$response->set_status( $status );
		return $response;
	}

	/**
	 * Create normalized response
	 *
	 * @param mixed $response Response.
	 *
	 * @return WP_REST_Response
	 */
	public static function response( $response ) {
		$response = new WP_REST_Response( $response );
		$response->set_status( 200 );
		return $response;
	}
}
