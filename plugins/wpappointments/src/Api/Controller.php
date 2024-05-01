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
use WPAppointments\Core\PluginInfo;

/**
 * Endpoint controller
 */
class Controller {
	const API_NAMESPACE = PluginInfo::API_NAMESPACE;

	/**
	 * Init method stub
	 *
	 * @return WP_Error
	 */
	public static function init() {
		return new WP_Error(
			'invalid_method',
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
	 * @param \WP_Error $error Error object.
	 *
	 * @return WP_REST_Response
	 */
	public static function error( $error ) {
		$code    = $error->get_error_code();
		$message = $error->get_error_message();
		$status  = $error->get_error_data()['status'] ?? 422;

		$data = array(
			'status'  => 'error',
			'code'    => $code,
			'message' => $message,
			'data'    => array(
				'status' => $status,
			),
		);

		$response = new WP_REST_Response( $data, $status );

		return $response;
	}

	/**
	 * Create normalized response
	 *
	 * @param string $message Response message.
	 * @param array  $data Response data.
	 *
	 * @return WP_REST_Response
	 */
	public static function response( $message, $data = array() ) {
		$response_data = array(
			'status'  => 'success',
			'message' => $message,
			'data'    => $data,
		);

		$response = new WP_REST_Response( $response_data, 200 );

		return $response;
	}
}
