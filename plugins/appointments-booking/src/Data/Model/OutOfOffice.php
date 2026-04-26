<?php
/**
 * OutOfOffice model file
 *
 * @package WPAppointments
 * @since 0.5.0
 */

namespace WPAppointments\Data\Model;

use WP_Error;
use WP_Post;
use WPAppointments\Core\PluginInfo;

/**
 * OutOfOffice model class
 */
class OutOfOffice {
	const FIELDS = array(
		'user_id',
		'start_date',
		'end_date',
		'reason',
		'notes',
		'note_public',
	);

	const ALLOWED_REASONS = array(
		'unspecified',
		'vacation',
		'travel',
		'sick_leave',
		'holiday',
	);

	/**
	 * OOO post
	 *
	 * @var WP_Post|WP_Error|null
	 */
	public $ooo;

	/**
	 * OOO data array
	 *
	 * @var array
	 */
	public $ooo_data = array();

	/**
	 * OutOfOffice constructor
	 *
	 * @param WP_Post|int|array|string $ooo OOO post, ID, or data array.
	 */
	public function __construct( $ooo ) {
		if ( $ooo instanceof WP_Post ) {
			if ( PluginInfo::POST_TYPES['ooo'] !== $ooo->post_type ) {
				$this->ooo = new WP_Error(
					'ooo_invalid_post_type',
					__( 'Post is not an OOO entry', 'appointments-booking' )
				);
				return;
			}
			$this->ooo = $ooo;
		} elseif ( is_array( $ooo ) ) {
			$this->parse_data( $ooo );
		} elseif ( is_int( $ooo ) || is_string( $ooo ) ) {
			$this->parse_from_id( $ooo );
		} else {
			$this->ooo = new WP_Error(
				'ooo_invalid_type',
				__( 'Invalid value passed to OutOfOffice constructor', 'appointments-booking' )
			);
		}
	}

	/**
	 * Create OOO entry
	 *
	 * @return OutOfOffice|WP_Error
	 */
	public function save() {
		if ( is_wp_error( $this->ooo ) ) {
			return $this->ooo;
		}

		if ( $this->ooo instanceof WP_Post ) {
			return new WP_Error(
				'ooo_already_persisted',
				__( 'This OOO entry is already persisted. Use update() instead', 'appointments-booking' )
			);
		}

		$data       = $this->ooo_data;
		$start_date = $data['start_date'] ?? '';
		$end_date   = $data['end_date'] ?? '';
		$reason     = $data['reason'] ?? 'unspecified';

		$title = self::generate_title( $reason, $start_date, $end_date );

		$post_id = wp_insert_post(
			array(
				'post_type'   => PluginInfo::POST_TYPES['ooo'],
				'post_status' => 'publish',
				'post_title'  => $title,
				'meta_input'  => array(
					'user_id'     => $data['user_id'] ?? 0,
					'start_date'  => $start_date,
					'end_date'    => $end_date,
					'reason'      => $reason,
					'notes'       => $data['notes'] ?? '',
					'note_public' => $data['note_public'] ?? false,
				),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$this->ooo_data['id'] = $post_id;
		$this->ooo            = get_post( $post_id );

		do_action( 'wpappointments_ooo_created', $this->normalize() );

		return $this;
	}

	/**
	 * Update OOO entry
	 *
	 * @param array $data Update data.
	 *
	 * @return OutOfOffice|WP_Error
	 */
	public function update( $data ) {
		if ( is_wp_error( $this->ooo ) ) {
			return $this->ooo;
		}

		if ( ! $this->ooo ) {
			return new WP_Error(
				'ooo_object_expected',
				__( 'OOO entry not found', 'appointments-booking' )
			);
		}

		$id = $this->ooo->ID;

		$meta_fields = array( 'start_date', 'end_date', 'reason', 'notes', 'note_public' );

		foreach ( $meta_fields as $field ) {
			if ( isset( $data[ $field ] ) ) {
				update_post_meta( $id, $field, $data[ $field ] );
			}
		}

		// Regenerate title if dates or reason changed.
		$start_date = $data['start_date'] ?? get_post_meta( $id, 'start_date', true );
		$end_date   = $data['end_date'] ?? get_post_meta( $id, 'end_date', true );
		$reason     = $data['reason'] ?? get_post_meta( $id, 'reason', true );

		$result = wp_update_post(
			array(
				'ID'         => $id,
				'post_title' => self::generate_title( $reason, $start_date, $end_date ),
			),
			true
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$this->ooo = get_post( $id );

		do_action( 'wpappointments_ooo_updated', $this->normalize() );

		return $this;
	}

	/**
	 * Delete OOO entry
	 *
	 * @return int|WP_Error
	 */
	public function delete() {
		if ( is_wp_error( $this->ooo ) ) {
			return $this->ooo;
		}

		if ( ! $this->ooo ) {
			return new WP_Error(
				'ooo_object_expected',
				__( 'OOO entry not found', 'appointments-booking' )
			);
		}

		$id      = $this->ooo->ID;
		$deleted = wp_delete_post( $id, true );

		if ( ! $deleted ) {
			return new WP_Error(
				'ooo_delete_failed',
				__( 'Failed to delete OOO entry', 'appointments-booking' )
			);
		}

		do_action( 'wpappointments_ooo_deleted', $id );

		$this->ooo      = null;
		$this->ooo_data = array();

		return $id;
	}

	/**
	 * Normalize OOO entry
	 *
	 * @param callable|null $normalizer Normalizer function.
	 *
	 * @return mixed
	 */
	public function normalize( $normalizer = null ) {
		if ( ! $normalizer ) {
			$normalizer = array( __CLASS__, 'default_normalizer' );
		}

		return call_user_func( $normalizer, $this );
	}

	/**
	 * Default normalizer
	 *
	 * @param OutOfOffice $data OutOfOffice model.
	 *
	 * @return array
	 */
	public static function default_normalizer( $data ) {
		$post = $data->ooo;

		if ( is_wp_error( $post ) || ! $post ) {
			return array();
		}

		$id     = $post->ID;
		$reason = get_post_meta( $id, 'reason', true );
		$notes  = get_post_meta( $id, 'notes', true );

		return array(
			'id'         => $id,
			'userId'     => absint( get_post_meta( $id, 'user_id', true ) ),
			'startDate'  => get_post_meta( $id, 'start_date', true ),
			'endDate'    => get_post_meta( $id, 'end_date', true ),
			'reason'     => $reason ? $reason : 'unspecified',
			'notes'      => $notes ? $notes : '',
			'notePublic' => (bool) get_post_meta( $id, 'note_public', true ),
		);
	}

	/**
	 * Generate title from reason and dates
	 *
	 * @param string $reason     Reason key.
	 * @param string $start_date Start date Y-m-d.
	 * @param string $end_date   End date Y-m-d.
	 *
	 * @return string
	 */
	private static function generate_title( $reason, $start_date, $end_date ) {
		$labels = array(
			'unspecified' => __( 'Time off', 'appointments-booking' ),
			'vacation'    => __( 'Vacation', 'appointments-booking' ),
			'travel'      => __( 'Travel', 'appointments-booking' ),
			'sick_leave'  => __( 'Sick Leave', 'appointments-booking' ),
			'holiday'     => __( 'Holiday', 'appointments-booking' ),
		);

		$label = $labels[ $reason ] ?? $labels['unspecified'];

		return sprintf( '%s: %s – %s', $label, $start_date, $end_date );
	}

	/**
	 * Parse data from array
	 *
	 * @param array $data OOO data.
	 */
	private function parse_data( $data ) {
		if ( empty( $data['start_date'] ) || empty( $data['end_date'] ) ) {
			$this->ooo = new WP_Error(
				'ooo_dates_required',
				__( 'Start date and end date are required', 'appointments-booking' )
			);
			return;
		}

		$this->ooo_data = wp_parse_args(
			$data,
			array(
				'user_id'     => 0,
				'start_date'  => '',
				'end_date'    => '',
				'reason'      => 'unspecified',
				'notes'       => '',
				'note_public' => false,
			)
		);
	}

	/**
	 * Parse from ID
	 *
	 * @param int|string $id Post ID.
	 */
	private function parse_from_id( $id ) {
		$post = get_post( absint( $id ) );

		if ( ! $post ) {
			$this->ooo = new WP_Error( 'ooo_not_found', __( 'OOO entry not found', 'appointments-booking' ) );
			return;
		}

		if ( PluginInfo::POST_TYPES['ooo'] !== $post->post_type ) {
			$this->ooo = new WP_Error( 'ooo_invalid_type', __( 'Post is not an OOO entry', 'appointments-booking' ) );
			return;
		}

		$this->ooo = $post;
	}
}
