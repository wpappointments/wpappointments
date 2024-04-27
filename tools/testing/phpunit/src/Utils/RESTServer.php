<?php
/**
 * WordPress PHPUnit test case class
 *
 * @package WPAppointments
 */

namespace TestTools\Utils;

/**
 * Spy REST API server class test utility
 */
class RESTServer extends \WP_REST_Server {
	/**
	 * Get the raw $endpoints data from the server
	 *
	 * @return array
	 */
	public function get_raw_endpoint_data() {
		return $this->endpoints;
	}

	/**
	 * Allow calling protected methods from tests
	 *
	 * @param string $method Method to call.
	 * @param array  $args Arguments to pass to the method.
	 *
	 * @return mixed
	 */
	public function __call( $method, $args ) {
		return call_user_func_array( array( $this, $method ), $args );
	}

	/**
	 * Call dispatch() with the rest_post_dispatch filter
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function dispatch( $request ) {
		$result = parent::dispatch( $request );
		$result = rest_ensure_response( $result );

		if ( is_wp_error( $result ) ) {
			$result = $this->error_to_response( $result );
		}

		$response = rest_ensure_response( $result );

		return apply_filters( 'rest_post_dispatch', $response, $this, $request );
	}
}
