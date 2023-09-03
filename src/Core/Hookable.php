<?php
/**
 * Interface for objects that can be used with hooks activator
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Core;

interface Hookable {
	/**
	 * Register all hooks applied in given class
	 *
	 * @return void
	 */
	public function register_hooks();
}
