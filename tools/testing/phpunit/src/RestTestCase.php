<?php
/**
 * WordPress PHPUnit test case class
 *
 * @package WPAppointments
 */

namespace TestTools;

use TestTools\Utils\RESTServer;

/**
 * Abstract WordPress PHPUnit test case class
 */
abstract class RestTestCase extends TestCase {
  /**
	 * @var WP_REST_Server
	 */
	protected $server;

	/**
	 * Setup our test server.
	 */
	protected function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new RESTServer();
		$this->server   = $wp_rest_server;
		do_action( 'rest_api_init' );
	}

	/**
	 * Unset the server.
	 */
	protected function tearDown(): void {
		parent::tearDown();

		global $wp_rest_server;
		unset( $this->server );
		$wp_rest_server = null;
	}

	/**
	 * Perform a REST request.
	 *
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param string     $verb HTTP verb for the request, default is GET.
	 * @param array|null $body_params Body parameters for the request, null if none are required.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return array Result from the request.
	 */
	public function do_rest_request( $url, $verb = 'GET', $body_params = null, $query_params = null ) {
		if ( '/' !== $url[0] ) {
			$url = '/wpappointments/v1/' . $url;
		}

		$request = new \WP_REST_Request( $verb, $url );
		if ( ! is_null( $query_params ) ) {
			$request->set_query_params( $query_params );
		}
		if ( ! is_null( $body_params ) ) {
			$request->set_body_params( $body_params );
		}

		return $this->server->dispatch( $request );
	}

	/**
	 * Perform a GET REST request.
	 *
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return WP_REST_Response The response for the request.
	 */
	public function do_rest_get_request( $url, $query_params = null ) {
		return $this->do_rest_request( $url, 'GET', null, $query_params );
	}

	/**
	 * Perform a POST REST request.
	 *
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param array|null $body_params Body parameters for the request, null if none are required.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return array Result from the request.
	 */
	public function do_rest_post_request( $url, $body_params = null, $query_params = null ) {
		return $this->do_rest_request( $url, 'POST', $body_params, $query_params );
	}

	/**
	 * Perform a PUT REST request.
	 *
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param array|null $body_params Body parameters for the request, null if none are required.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return array Result from the request.
	 */
	public function do_rest_put_request( $url, $body_params = null, $query_params = null ) {
		return $this->do_rest_request( $url, 'PUT', $body_params, $query_params );
	}

	/**
	 * Perform a PATCH REST request.
	 *
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param array|null $body_params Body parameters for the request, null if none are required.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return array Result from the request.
	 */
	public function do_rest_patch_request( $url, $body_params = null, $query_params = null ) {
		return $this->do_rest_request( $url, 'PATCH', $body_params, $query_params );
	}

	/**
	 * Perform a DELETE REST request.
	 * 
	 * @param string     $url The endpopint url, if it doesn't start with '/' it'll be prepended with '/wc/v3/'.
	 * @param array|null $query_params Query string parameters for the request, null if none are required.
	 * @return array Result from the request.
	 */
	public function do_rest_delete_request( $url, $query_params = null ) {
		return $this->do_rest_request( $url, 'DELETE', null, $query_params );
	}
}