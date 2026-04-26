<?php
/**
 * Plugin activation class file
 *
 * @package WPAppointments
 * @since 0.0.1
 */

namespace WPAppointments\Core;

use WPAppointments\Plugin;

/**
 * Activate and deactivate plugin hooks
 */
class Activation {
	/**
	 * Register activation and deactivation hooks
	 *
	 * @param PluginInfo $info   Plugin info instance.
	 * @param Plugin     $plugin Plugin instance.
	 *
	 * @return void
	 */
	public static function register_hooks( PluginInfo $info, Plugin $plugin ) {
		register_activation_hook(
			$info->get_plugin_file(),
			array(
				$plugin,
				'on_plugin_activation',
			)
		);

		register_deactivation_hook(
			$info->get_plugin_file(),
			array(
				$plugin,
				'on_plugin_deactivation',
			)
		);
	}
}
