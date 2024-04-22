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
  private $info;
  private $plugin;

  public function __construct($info = null, $plugin = null) {
    $this->info = $info;
    $this->plugin = $plugin;
  }

  /**
   * Register activation and deactivation hooks
   *
   * @return void
   */
  public function register_hooks() {
    register_activation_hook(
      $this->info->get_plugin_file(),
      array(
        $this->plugin,
        'on_plugin_activation',
      )
    );

    register_deactivation_hook(
      $this->info->get_plugin_file(),
      array(
        $this->plugin,
        'on_plugin_deactivation',
      )
    );
  }
}