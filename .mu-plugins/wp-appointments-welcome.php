<?php
/**
 * Plugin Name: Welcome to WP Appointments
 * Description: Custom WordPress dashboard welcome panel for WP Appointments
 * Plugin Author: wppoland.com
 * Version: 2.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'admin_init', function () {
	remove_action( 'welcome_panel', 'wp_welcome_panel' );
} );

add_action( 'welcome_panel', function () {
	$plugin_file  = 'wpappointments/wpappointments.php';
	$activate_url = wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . urlencode( $plugin_file ) . '&amp;plugin_status=all&amp;paged=1&', 'activate-plugin_' . $plugin_file );
	$settings_url = admin_url( 'admin.php?page=wpappointments-settings' );
	$calendar_url = admin_url( 'admin.php?page=wpappointments-calendar' );
	?>
	<div class="welcome-panel-content">
		<div class="welcome-panel-header-wrapper">
			<div class="welcome-panel-header">
				<h2><?php esc_html_e( 'Welcome to WP Appointments', 'wpappointments' ); ?></h2>
				<p>
					<?php esc_html_e( 'A flexible appointment scheduling plugin for WordPress. Create bookable services, manage availability, and let your customers book directly from your site.', 'wpappointments' ); ?>
				</p>
			</div>
		</div>
		<div class="welcome-panel-column-container">
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Booking Flow', 'wpappointments' ); ?></h3>
					<p>
						<?php esc_html_e( 'Embed the booking calendar anywhere using the Gutenberg block, shortcode, widget, or PHP template tag. Supports single-step and multi-step flows.', 'wpappointments' ); ?>
					</p>
				</div>
			</div>
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Schedule & Availability', 'wpappointments' ); ?></h3>
					<p>
						<?php esc_html_e( 'Define opening hours per weekday, set appointment gaps, and control how far in advance customers can book with min/max lead times.', 'wpappointments' ); ?>
					</p>
				</div>
			</div>
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Notifications', 'wpappointments' ); ?></h3>
					<p>
						<?php esc_html_e( 'Automatic email notifications for created, updated, confirmed, and cancelled appointments. Customize subjects, bodies, and recipients.', 'wpappointments' ); ?>
					</p>
				</div>
			</div>
		</div>
		<div class="welcome-panel-column-container">
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Extensible by Design', 'wpappointments' ); ?></h3>
					<p>
						<?php esc_html_e( 'Register custom bookable types via plugins. The core is an engine with hooks, filters, and a UI extension API for addon developers.', 'wpappointments' ); ?>
					</p>
				</div>
			</div>
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Getting Started', 'wpappointments' ); ?></h3>
					<ol class="welcome-panel-steps">
						<li><?php esc_html_e( 'Configure your schedule in Settings', 'wpappointments' ); ?></li>
						<li><?php esc_html_e( 'Add the Booking Flow block to a page', 'wpappointments' ); ?></li>
						<li><?php esc_html_e( 'Manage appointments from the Calendar', 'wpappointments' ); ?></li>
					</ol>
					<?php if ( is_plugin_active( $plugin_file ) ) : ?>
						<div class="welcome-panel-actions">
							<a href="<?php echo esc_url( $settings_url ); ?>" class="button button-secondary">
								<?php esc_html_e( 'Settings', 'wpappointments' ); ?>
							</a>
							<a href="<?php echo esc_url( $calendar_url ); ?>" class="button button-secondary">
								<?php esc_html_e( 'Calendar', 'wpappointments' ); ?>
							</a>
						</div>
					<?php endif; ?>
				</div>
			</div>
			<div class="welcome-panel-column">
				<div class="welcome-panel-column-content">
					<h3><?php esc_html_e( 'Coming Soon', 'wpappointments' ); ?></h3>
					<ul class="welcome-panel-roadmap">
						<li><?php esc_html_e( '2-way Google Calendar & Outlook sync', 'wpappointments' ); ?></li>
						<li><?php esc_html_e( 'Elementor, Bricks & Divi integrations', 'wpappointments' ); ?></li>
						<li><?php esc_html_e( 'Week and day calendar views', 'wpappointments' ); ?></li>
						<li><?php esc_html_e( 'Premium addons for advanced use cases', 'wpappointments' ); ?></li>
					</ul>
				</div>
			</div>
		</div>
		<?php if ( ! is_plugin_active( $plugin_file ) ) : ?>
			<div class="welcome-panel-footer-wrapper">
				<footer class="welcome-panel-footer">
					<a href="<?php echo esc_url( $activate_url ); ?>" class="button button-primary">
						<?php esc_html_e( 'Activate WP Appointments', 'wpappointments' ); ?>
					</a>
				</footer>
			</div>
		<?php endif; ?>
	</div>
	<?php
} );

add_action( 'wp_dashboard_setup', function () {
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_site_health', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_right_now', 'dashboard', 'normal' );
	remove_meta_box( 'dashboard_activity', 'dashboard', 'normal' );
} );

add_action( 'admin_head', function () {
	?>
	<style>
		:root {
			--brand-color-default: #0053fa;
			--brand-color-light: #1577fa;
			--brand-color-dark: #001d2e;
			--max-width: 1500px;
		}

		.welcome-panel-close,
		#dashboard-widgets-wrap {
			display: none;
		}

		.welcome-panel {
			background-color: #fff;
		}

		.wp-admin #wpwrap {
			overflow-x: hidden;
		}

		.welcome-panel-header-wrapper {
			background-color: var(--brand-color-default);
		}

		.welcome-panel-header {
			max-width: var(--max-width);
			margin-inline: auto;
			padding: 48px;
		}

		.welcome-panel-header::before {
			position: absolute;
			top: 0;
			right: 0;
			height: 100%;
			width: 50%;
			content: '';
			opacity: 0.2;
			background-image: url("data:image/svg+xml,%3Csvg id='uuid-108c8467-2f60-4f27-9cc3-731fecd27c8f' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 51.44 51.44'%3E%3Cg id='uuid-0e84affd-ba30-440d-9b7b-52f64fe4c4f3'%3E%3Cpath d='m25.72,0C11.54,0,0,11.54,0,25.72s11.54,25.72,25.72,25.72,25.72-11.54,25.72-25.72S39.9,0,25.72,0Zm0,40.04c-7.9,0-14.33-6.43-14.33-14.32s6.43-14.33,14.33-14.33,14.33,6.43,14.33,14.33-6.43,14.32-14.33,14.32Z' fill='%23ffffff'/%3E%3Crect x='20.39' y='19.56' width='14.35' height='9.09' transform='translate(-8.97 26.55) rotate(-45)' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-size: 75%;
			background-position: calc(100% - 20px) 20px;
		}

		.welcome-panel-header h2 {
			font-size: 44px;
		}

		.welcome-panel-header p {
			max-width: 75%;
		}

		.welcome-panel .welcome-panel-column-container {
			max-width: var(--max-width);
			margin-inline: auto;
		}

		.welcome-panel-column-content {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.welcome-panel-column {
			display: block;
			max-width: none;
		}

		.welcome-panel-column .button-secondary {
			align-self: start;
			color: var(--brand-color-default);
			border-color: var(--brand-color-default);
			background-color: transparent;
		}

		.welcome-panel-column .button-secondary:hover,
		.welcome-panel-column .button-secondary:active {
			color: white;
			background-color: var(--brand-color-light);
			border-color: var(--brand-color-light);
		}

		.welcome-panel-column-content h3,
		.welcome-panel-column-content p {
			margin: 0;
		}

		.welcome-panel-column-content p {
			line-height: 1.5;
		}

		.welcome-panel-steps {
			margin: 0;
			padding-left: 1.2em;
			line-height: 1.8;
		}

		.welcome-panel-roadmap {
			margin: 0;
			padding-left: 1.2em;
			line-height: 1.8;
		}

		.welcome-panel-actions {
			display: flex;
			gap: 8px;
		}

		.welcome-panel-footer-wrapper {
			background-color: #fafafa;
		}

		.welcome-panel-footer {
			max-width: var(--max-width);
			margin-inline: auto;
			padding: 24px 32px;
			box-sizing: border-box;
		}

		.welcome-panel-footer .button-primary {
			padding-block: 0.5rem;
			padding-inline: 2rem;
			font-size: 1rem;
			background-color: var(--brand-color-default);
		}

		.welcome-panel-footer .button-primary:hover,
		.welcome-panel-footer .button-primary:active {
			background-color: var(--brand-color-light);
			color: white;
		}

		@media (min-width: 769px) {
			.welcome-panel-footer {
				padding: 24px 48px;
			}
		}
	</style>
	<?php
} );
