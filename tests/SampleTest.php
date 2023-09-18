<?php
/**
 * Class SampleTest
 *
 * @package Plugin
 */

/**
 * Sample test case.
 */
class SampleTest extends \WP_UnitTestCase {
	public function test_plugin_init() {
		$plugin = \WPAppointments\Plugin::get_instance();
		$initialized = $plugin->plugin_init();

		// everything is ok.
		expect($initialized)->toBeNull();
	}

	public function test_init_plugin_when_php_requrement_not_met() {
		$plugin = \WPAppointments\Plugin::get_instance();
		// set very high php version requirement,
		// to trigger early return.
		$initialized = $plugin->plugin_init('999.0.0');

		// returned early.
		expect($initialized)->toBeFalse();
	}

	public function test_plugin_hooks_added() {
		global $wp_filter;

		$plugin = \WPAppointments\Plugin::get_instance();
		$plugin_init_priority = $wp_filter['plugins_loaded']->has_filter('plugins_loaded', [$plugin, 'plugin_init']);

  	expect($plugin_init_priority)->toBe(10);
  	expect(post_type_exists('appointment'))->toBe(true);
	}
}