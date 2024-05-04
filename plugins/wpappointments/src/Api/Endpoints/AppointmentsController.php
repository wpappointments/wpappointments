<?php
/**
 * Example controller (appointment endpoint)
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Api\Endpoints;

use WP_REST_Server;
use WP_REST_Request;
use WPAppointments\Api\Controller;
use WPAppointments\Data\Model\Appointment;
use WPAppointments\Data\Model\Settings;
use WPAppointments\Data\Query\AppointmentsQuery;

/**
 * Appointment endpoint class
 */
class AppointmentsController extends Controller {
	/**
	 * Register all routes
	 *
	 * @return void
	 */
	public static function init() {
		self::init_public_routes();

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_all_appointments' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/upcoming',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( __CLASS__, 'get_upcoming_appointments' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'update_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)/cancel',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'cancel_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( __CLASS__, 'delete_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			static::API_NAMESPACE,
			'/appointments/(?P<id>\d+)/confirm',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( __CLASS__, 'confirm_appointment' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Register public routes
	 *
	 * @return void
	 */
	public static function init_public_routes() {
		register_rest_route(
			static::API_NAMESPACE,
			'/public/appointments',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( __CLASS__, 'create_appointment_public' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Get all appointments
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_all_appointments( WP_REST_Request $request ) {
		$query   = $request->get_param( 'query' );
		$results = AppointmentsQuery::all( $query );

		return self::response(
			__( 'Appointments fetched successfully', 'wpappointments' ),
			self::paginated( 'appointments', $results )
		);
	}

	/**
	 * Get upcoming appointments
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function get_upcoming_appointments( WP_REST_Request $request ) {
		$query   = $request->get_param( 'query' );
		$results = AppointmentsQuery::upcoming( $query );

		return self::response(
			__( 'Upcoming appointments fetched successfully', 'wpappointments' ),
			self::paginated( 'appointments', $results )
		);
	}

	/**
	 * Create appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_appointment( WP_REST_Request $request ) {
		$date        = $request->get_param( 'date' );
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );
		$status      = $request->get_param( 'status' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$appointment       = new Appointment(
			array(
				'title'    => $service,
				'customer' => $customer,
				'meta'     => array(
					'timestamp'   => $date,
					'duration'    => $duration,
					'customer_id' => $customer_id,
					'status'      => $status,
				),
			)
		);
		$saved_appointment = $appointment->save();

		return self::response(
			__( 'Appointment created successfully', 'wpappointments' ),
			array(
				'appointment' => $saved_appointment->normalize( array( __CLASS__, 'normalize' ) ),
			),
		);
	}

	/**
	 * Create appointment post (publicly accessible)
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function create_appointment_public( WP_REST_Request $request ) {
		$date           = $request->get_param( 'date' );
		$customer       = $request->get_param( 'customer' );
		$create_account = $request->get_param( 'createAccount' );
		$password       = $request->get_param( 'password' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$settings = new Settings();

		$default_duration = $settings->get_setting( 'appointments', 'defaultLength' );
		$duration         = $default_duration ? $default_duration : 60;

		$default_status  = $settings->get_setting( 'appointments', 'defaultStatus' );
		$status          = $default_status ? $default_status : 'confirmed';
		$default_service = $settings->get_default_service();

		$appointment       = new Appointment(
			array(
				'title'          => $default_service->post_title ?? __( 'Appointment', 'wpappointments' ),
				'customer'       => $customer,
				'create_account' => $create_account,
				'password'       => $password,
				'meta'           => array(
					'timestamp'  => $date,
					'duration'   => $duration,
					'status'     => $status,
					'service_id' => $default_service->ID ?? null,
				),
			)
		);
		$saved_appointment = $appointment->save();

		return self::response(
			__( 'Appointment created successfully', 'wpappointments' ),
			array(
				'appointment' => $saved_appointment->normalize( array( __CLASS__, 'normalize' ) ),
			),
		);
	}

	/**
	 * Update appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function update_appointment( WP_REST_Request $request ) {
		$id          = $request->get_param( 'id' );
		$date        = $request->get_param( 'date' );
		$service     = $request->get_param( 'service' );
		$duration    = $request->get_param( 'duration' );
		$status      = $request->get_param( 'status' );
		$customer    = $request->get_param( 'customer' );
		$customer_id = $request->get_param( 'customerId' );

		$date = rest_parse_date( get_gmt_from_date( $date ) );

		$appointment         = new Appointment( $id );
		$updated_appointment = $appointment->update(
			array(
				'title'    => $service,
				'customer' => $customer,
				'meta'     => array(
					'timestamp'   => $date,
					'duration'    => $duration,
					'customer_id' => $customer_id,
					'status'      => $status,
				),
			)
		);

		if ( is_wp_error( $updated_appointment ) ) {
			return self::error( $updated_appointment );
		}

		return self::response(
			__( 'Appointment updated successfully', 'wpappointments' ),
			array(
				'appointment' => $updated_appointment->normalize( array( __CLASS__, 'normalize' ) ),
			),
		);
	}

	/**
	 * Cancel appointment
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function cancel_appointment( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$appointment_post = new Appointment( $id );
		$cancelled        = $appointment_post->cancel();

		if ( is_wp_error( $cancelled ) ) {
			return self::error( $cancelled );
		}

		return self::response(
			__( 'Appointment cancelled successfully', 'wpappointments' ),
			array(
				'appointmentId' => $cancelled,
			),
		);
	}

	/**
	 * Delete appointment post
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function delete_appointment( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$appointment_post = new Appointment( $id );
		$deleted          = $appointment_post->delete();

		if ( is_wp_error( $deleted ) ) {
			return self::error( $deleted );
		}

		return self::response(
			__( 'Appointment deleted successfully', 'wpappointments' ),
			array(
				'appointmentId' => $deleted,
			),
		);
	}

	/**
	 * Confirm appointment
	 *
	 * @param WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public static function confirm_appointment( WP_REST_Request $request ) {
		$id = $request->get_param( 'id' );

		$appointment_post = new Appointment( $id );
		$confirmed        = $appointment_post->confirm();

		if ( is_wp_error( $confirmed ) ) {
			return self::error( $confirmed );
		}

		return self::response(
			__( 'Appointment confirmed successfully', 'wpappointments' ),
			array(
				'appointmentId' => $confirmed,
			),
		);
	}

	/**
	 * Default normalizer
	 *
	 * @param WP_Post $appointment Appointment post object.
	 *
	 * @return array
	 */
	public static function normalize( $appointment ) {
		$length = (int) get_option( 'wpappointments_appointments_defaultLength' );

		$timestamp   = get_post_meta( $appointment->ID, 'timestamp', true );
		$status      = get_post_meta( $appointment->ID, 'status', true );
		$duration    = get_post_meta( $appointment->ID, 'duration', true ) ?? $length;
		$customer_id = get_post_meta( $appointment->ID, 'customer_id', true ) ?? 0;
		$customer    = get_post_meta( $appointment->ID, 'customer', true ) ?? null;

		return array(
			'id'         => $appointment->ID,
			'service'    => $appointment->post_title,
			'status'     => $status,
			'timestamp'  => (int) $timestamp,
			'duration'   => (int) $duration,
			'customerId' => (int) $customer_id,
			'customer'   => $customer,
		);
	}
}
