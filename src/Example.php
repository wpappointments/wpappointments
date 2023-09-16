<?php
/**
 * Example class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments;

/**
 * Class Example
 */
class Example {
	/**
	 * Add two numbers
	 *
	 * @param int $a Number 1.
	 * @param int $b Number 2.
	 * @return int
	 */
	public function add( $a, $b ) {
		return $a + $b;
	}

	/**
	 * Get default post title
	 *
	 * @return string
	 */
	public function testwp() {
		$default_post_id = get_option( 'default_post_id' );
		$post            = get_post( $default_post_id );
		return $post->post_title;
	}
}
