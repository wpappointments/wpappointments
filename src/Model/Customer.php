<?php
/**
 * Customer model file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Model;

/**
 * Customer model class
 */
class Customer {
	/**
	 * Default query part for customers
	 *
	 * @var array
	 */
	private $default_query_part = array(
		'role'    => 'wpa-customer',
		'number'  => 10,
		'paged'   => 1,
		'orderby' => 'registered',
		'order'   => 'DESC',
	);

	/**
	 * Prepare user entity
	 *
	 * @param \WP_User $user User object.
	 * @param array    $meta User meta.
	 *
	 * @return object
	 */
	protected function prepare_user_entity( $user, $meta ) {
		return (object) array(
			'id'      => $user->ID,
			'name'    => $user->display_name,
			'email'   => $user->user_email,
			'phone'   => $meta['phone'],
			'created' => $user->user_registered,
			'actions' => (object) array(
				'delete' => (object) array(
					'name'        => 'DeleteCustomer',
					'label'       => 'Delete',
					'method'      => 'DELETE',
					'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . ' / customer / ' . $user->ID ),
					'isDangerous' => true,
				),
				'edit'   => (object) array(
					'name'        => 'EditCustomer',
					'label'       => 'Edit',
					'method'      => 'PUT',
					'uri'         => rest_url( WPAPPOINTMENTS_API_NAMESPACE . ' / customer / ' . $user->ID ),
					'isDangerous' => false,
				),
			),
		);
	}

	/**
	 * Get all customers
	 *
	 * @param array $query Query params.
	 *
	 * @return object
	 */
	public function get_all( $query ) {
		$users          = array();
		$posts_per_page = $query['number'] ?? 10;
		$paged          = $query['paged'] ?? 1;

		$query = new \WP_User_Query(
			array_merge(
				$this->default_query_part,
				(array) $query
			)
		);

		foreach ( $query->get_results() as $user ) {
			$meta    = get_user_meta( $user->ID );
			$users[] = $this->prepare_user_entity(
				$user,
				array(
					'phone' => $meta['phone'],
				)
			);
		}

		return (object) array(
			'customers'      => $users,
			'total_items'    => $query->total_users,
			'total_pages'    => ceil( $query->total_users / $posts_per_page ),
			'posts_per_page' => $posts_per_page,
			'current_page'   => $paged,
		);
	}

	/**
	 * Create new customer
	 *
	 * @param object $customer Customer data object.
	 * @param string $password Customer password in plain text.
	 *
	 * @return int|\WP_Error
	 */
	public function create( $customer, $password = null ) {
		$email = sanitize_text_field( wp_unslash( $customer->email ), true );
		$name  = sanitize_user( wp_unslash( $customer->name ), true );

		$user_id = wp_insert_user(
			array(
				'user_login'   => $email ?: $name,
				'user_pass'    => $password ?? wp_generate_password(),
				'user_email'   => $email,
				'display_name' => $name,
				'role'         => 'wpa-customer',
			)
		);

		if ( is_wp_error( $user_id ) ) {
			return $user_id;
		}

		update_user_meta( $user_id, 'phone', sanitize_text_field( $customer->phone ) );

		return $user_id;
	}

	public function delete( $id ) {
		require_once ABSPATH . 'wp-admin/includes/user.php';

		$valid_id = $this->validate_user_id( $id );

		if ( is_wp_error( $valid_id ) ) {
			return $valid_id;
		}

		$deleted = wp_delete_user( $id );

		if ( $deleted ) {
			return true;
		}

		return new \WP_Error( 'error', __( 'Could not delete appointment', 'wpappointments' ) );
	}

	protected function validate_user_id( $post_id ) {
		if ( ! $post_id ) {
			return new \WP_Error( 'error', __( 'User ID is required', 'wpappointments' ) );
		}

		if ( ! get_user_by( 'ID', $post_id ) ) {
			return new \WP_Error( 'error', __( 'User not found', 'wpappointments' ) );
		}

		return $post_id;
	}
}
