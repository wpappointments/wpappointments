<?php
/**
 * Customer controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Data\Model\Customer;
use WPAppointments\Data\Query\CustomersQuery;

/**
 * Customer endpoint class
 */
class CustomersController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::API_NAMESPACE,
			'/customers',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/customers',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/customers/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/customers/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get all WP Appointment customers
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_all( WP_REST_Request $request ) {
		$query   = $request->get_param( 'query' ) ?? array();
		$results = CustomersQuery::all( $query );

		return self::response(
			array(
				'type' => 'success',
				'data' => self::paginated( $results ),
			)
		);
	}

	/**
	 * Create a new WP Appointment customer
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create( WP_REST_Request $request ) {
		$name     = $request->get_param( 'name' );
		$email    = $request->get_param( 'email' );
		$phone    = $request->get_param( 'phone' );
		$password = $request->get_param( 'password' );

		$customer       = new Customer(
			array(
				'name'     => $name,
				'email'    => $email,
				'phone'    => $phone,
				'password' => $password,
			)
		);
		$saved_customer = $customer->save();

		if ( is_wp_error( $saved_customer ) ) {
			return self::error( $saved_customer->get_error_message() );
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message'  => __( 'Customer created successfully', 'wpappointments' ),
					'customer' => $saved_customer->normalize( array( __CLASS__, 'normalize' ) ),
				),
			)
		);
	}

	/**
	 * Update a customer
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update( WP_REST_Request $request ) {
		$id    = $request->get_param( 'id' );
		$name  = $request->get_param( 'name' );
		$email = $request->get_param( 'email' );
		$phone = $request->get_param( 'phone' );

		$customer         = new Customer( $id );
		$updated_customer = $customer->update(
			array(
				'name'  => $name,
				'email' => $email,
				'phone' => $phone,
			)
		);

		if ( is_wp_error( $updated_customer ) ) {
			return self::error( $updated_customer->get_error_message() );
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => array(
					'message'  => __( 'Customer updated successfully', 'wpappointments' ),
					'customer' => $updated_customer->normalize( array( __CLASS__, 'normalize' ) ),
				),
			)
		);
	}

	/**
	 * Delete a customer
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete( WP_REST_Request $request ) {
		$customer = new Customer( $request->get_param( 'id' ) );
		$result   = $customer->delete();

		return self::response(
			array(
				'type'    => 'success',
				'message' => __( 'Customer deleted successfully', 'wpappointments' ),
				'data'    => array(
					'id' => $result,
				),
			)
		);
	}

	/**
	 * Prepare entity for API endpoint response
	 *
	 * @param \WP_User $user User object.
	 *
	 * @return object
	 */
	public static function normalize( $user ) {
		$phone = get_user_meta( $user->ID, 'phone', true );

		return array(
			'id'      => $user->ID,
			'name'    => $user->display_name,
			'email'   => $user->user_email,
			'phone'   => $phone,
			'created' => $user->user_registered,
			'updated' => $user->user_registered,
		);
	}

	/**
	 * Paginate results
	 *
	 * @param array $results Results array.
	 *
	 * @return array
	 */
	public static function paginated( $results ) {
		return array(
			'customers'    => $results['customers'],
			'totalItems'   => $results['total_items'],
			'totalPages'   => $results['total_pages'],
			'postsPerPage' => $results['posts_per_page'],
			'currentPage'  => $results['current_page'],
		);
	}
}
