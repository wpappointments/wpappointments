<?php
/**
 * Facotry
 *
 * @package WPAppointments
 * @since 0.1.2
 */

namespace TestTools\Factory;

use WP_UnitTest_Factory_For_Thing;
use WP_UnitTest_Generator_Sequence;
use WPAppointments\Data\Model\Appointment;

/**
 * Unit test factory for posts.
 *
 * Note: The below @method notations are defined solely for the benefit of IDEs,
 * as a way to indicate expected return values from the given factory methods.
 *
 * @method int|WP_Error     create( $args = array(), $generation_definitions = null )
 * @method WP_Post|WP_Error create_and_get( $args = array(), $generation_definitions = null )
 * @method (int|WP_Error)[] create_many( $count, $args = array(), $generation_definitions = null )
 */
class AppointmentFactory extends WP_UnitTest_Factory_For_Thing {
	/**
	 * Constructor.
	 *
	 * @param WP_UnitTest_Factory $factory Factory object.
	 *
	 * @return void
	 */
	public function __construct( $factory = null ) {
		parent::__construct( $factory );

		$this->default_generation_definitions = array(
			'id'           => new WP_UnitTest_Generator_Sequence( '%d' ),
			'post_status'  => 'publish',
			'post_type'    => 'wpa-appointment',
			'post_title'   => new WP_UnitTest_Generator_Sequence( 'Appointment %s' ),
			'post_content' => new WP_UnitTest_Generator_Sequence( 'Appointment content %s' ),
			'user_id'      => new WP_UnitTest_Generator_Sequence( '%d' ),
			'user_login'   => new WP_UnitTest_Generator_Sequence( 'User %s' ),
			'user_email'   => new WP_UnitTest_Generator_Sequence( 'user_%s@example.org' ),
			'user_phone'   => new WP_UnitTest_Generator_Sequence( '+1 (000) 000-000%d' ),
		);
	}

	/**
	 * Creates a post object.
	 *
	 * @param array $args Array with elements for the post.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function create_object( $args ) {
		$id = $args['id'] ?? 0;

		$customer_data = array(
			'name'  => $args['user_login'],
			'email' => $args['user_email'],
			'phone' => $args['user_phone'],
		);

		$appointments_meta = array(
			'timestamp'   => time() + (int) $id,
			'duration'    => 60,
			'customer_id' => $args['user_id'] ?? 0,
			'status'      => 'confirmed',
		);

		if ( isset( $args['meta'] ) ) {
			$appointments_meta = wp_parse_args( $args['meta'], $appointments_meta );
		}

		if ( isset( $args['customer'] ) ) {
			$customer_data = wp_parse_args( $args['customer'], $customer_data );
		}

		$appointment_data = array(
			'title'          => $args['post_title'],
			'meta'           => $appointments_meta,
			'customer'       => $customer_data,
			'create_account' => $args['create_account'] ?? false,
			'password'       => $args['password'] ?? false,
		);

		$appointment = new Appointment( $appointment_data );
		$saved       = $appointment->save();

		return $saved;
	}

	/**
	 * Updates an existing post object.
	 *
	 * @param int   $post_id ID of the post to update.
	 * @param array $fields  Post data.
	 *
	 * @return int|WP_Error The post ID on success, WP_Error object on failure.
	 */
	public function update_object( $post_id, $fields ) {
		$fields['ID'] = $post_id;
		return wp_update_post( $fields, true );
	}

	/**
	 * Retrieves a post by a given ID.
	 *
	 * @since UT (3.7.0)
	 *
	 * @param int $post_id ID of the post to retrieve.
	 *
	 * @return WP_Post|null WP_Post object on success, null on failure.
	 */
	public function get_object_by_id( $post_id ) {
		return get_post( $post_id );
	}
}
