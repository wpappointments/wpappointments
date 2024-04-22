<?php
/**
 * Customer controller
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use stdClass;
use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Model\Customer as ModelCustomer;

/**
 * Customer endpoint
 */
class Customer extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_customers' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_customer' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		register_rest_route(
			static::ROUTE_NAMESPACE,
			'/customer/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete' ),
					'permission_callback' => '__return_true',
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
	public static function get_all_customers( WP_REST_Request $request ) {
		$query    = $request->get_param( 'query' );
		$customer = new ModelCustomer();
		$results  = $customer->get_all( $query );

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'customers'    => $results->customers,
					'totalItems'   => $results->totalItems,
					'totalPages'   => $results->totalPages,
					'postsPerPage' => $results->postsPerPage,
					'currentPage'  => $results->currentPage,
				),
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
	public static function create_customer( WP_REST_Request $request ) {
		$name  = $request->get_param( 'name' );
		$email = $request->get_param( 'email' );
		$phone = $request->get_param( 'phone' );

		$model           = new ModelCustomer();
		$customer        = new stdClass();
		$customer->email = $email;
		$customer->name  = $name;
		$customer->phone = $phone;
		$user            = $model->create( $customer );

		if ( is_wp_error( $user ) ) {
			return self::response(
				array(
					'type' => 'error',
					'data' => (object) array(
						'message' => $user->get_error_message(),
					),
				)
			);
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'message'  => __( 'Customer created successfully', 'wpappointments' ),
					'customer' => array(
						'id'      => $user->ID,
						'name'    => $name,
						'email'   => $email,
						'phone'   => $phone,
						'created' => $user->user_registered,
					),
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
		$model  = new ModelCustomer();
		$result = $model->delete( $request->get_param( 'id' ) );

		if ( is_wp_error( $result ) ) {
			return self::error( $result->get_error_message() );
		}

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

		$model           = new ModelCustomer();
		$customer        = new stdClass();
		$customer->email = $email;
		$customer->name  = $name;
		$customer->phone = $phone;
		$user            = $model->update( $id, $customer );

		if ( is_wp_error( $user ) ) {
			return self::response(
				array(
					'type' => 'error',
					'data' => (object) array(
						'message' => $user->get_error_message(),
					),
				)
			);
		}

		return self::response(
			array(
				'type' => 'success',
				'data' => (object) array(
					'message'  => __( 'Customer updated successfully', 'wpappointments' ),
					'customer' => array(
						'id'      => $user->ID,
						'name'    => $name,
						'email'   => $email,
						'phone'   => $phone,
						'created' => $user->user_registered,
					),
				),
			)
		);
	}
}
