<?php
/**
 * Plugin Name: Welcome to WP Appointments
 * Description: Remove default WordPress widgets and displays ours welcome message
 * Plugin Author: WP Appointments Team
 * Version: 1.0
 */

add_action( 'admin_init', function () {
	remove_action( 'welcome_panel', 'wp_welcome_panel' );
} );

add_action( 'welcome_panel', function () {
	$plugin_file  = 'wpappointments/wpappointments.php';
	$activate_url = wp_nonce_url( 'plugins.php?action=activate&amp;plugin=' . urlencode( $plugin_file ) . '&amp;plugin_status=all&amp;paged=1&', 'activate-plugin_' . $plugin_file )
	?>
    <div class="welcome-panel-content">
        <div class="welcome-panel-header-wrapper">
            <div class="welcome-panel-header">
                <h2><?php _e( 'Welcome to WP Appointments!' ); ?></h2>
                <p>
                    We're thrilled to let you peek behind the curtain at our WP Appointments plugin, which is currently
                    in
                    beta. Our team is refining and enhancing its features to align perfectly with your needs. Right now,
                    you
                    have access to the foundational features of our free version.
                </p>
            </div>
        </div>
        <div class="welcome-panel-column-container">
            <div class="welcome-panel-column">
                <div class="welcome-panel-column-content">
                    <h3>
                        What's inside?
                    </h3>
                    <p>
                        At this stage, you can easily manage meetings, tweak them to your heart's content, and add
                        clients smoothly. Moreover, you can define available time intervals in settings, making
                        availability clear. With a calendar view on the website, you can make hassle-free meeting
                    </p>
                </div>
            </div>
            <div class="welcome-panel-column">
                <div class="welcome-panel-column-content">
                    <h3>
                        What's next?
                    </h3>
                    <p>
                        But we're far from done. We're already working on introducing services, locations and
                        revamping
                        our calendar view to make your planning process even more seamless.
                    </p>
                </div>
            </div>
            <div class="welcome-panel-column">
                <div class="welcome-panel-column-content">
                    <h3>
                        Feedback is key
                    </h3>
                    <p>
                        Your feedback is crucial to us. Your insights and suggestions will truly shape the future of
                        WP
                        Appointments. We'd be deeply grateful if you could share your feedback through this survey.
                        Let's collaborate to create a future of effortless scheduling.
                    </p>
                    <a href="#" class="button button-secondary js-feedback-link">Send Feedback</a>
                </div>
            </div>
        </div>
        <div class="welcome-panel-column-container-one-col">
            <div class="welcome-panel-column">
                <div class="welcome-panel-column-content">
                    <h3>
                        Demo plugin limitations
                    </h3>
                    <p>
                        Please bear in mind that this is a beta version, and some features are still in the works.
                    </p>
                    <p>
                        Everything you see here is a work in progress and subject to change. We're working hard to make WP Appointments the best it can be, and we appreciate your patience and support.
                    </p>
                    <ul class="welcome-panel-list">
                        <li>🚫 No extensions available at this point, including: services, employees, locations or calendar sync</li>
                        <li>🚫 Admin calendar view - only month view</li>
                        <li>🚫 Limited number of options in the frontend booking flow Gutenberg block</li>
                        <li>🚫 No shortcode builder available yet. Only gutenberg block</li>
                        <li>🚫 Email notifications are not yet editable or customizable</li>
                        <li>🚫 Only simple opening hours schedule available. No days off or holiday settings</li>
                        <li>🚫 No stats or reports available yet</li>
                    </ul>
                </div>
            </div>
        </div>
        <?php if ( !is_plugin_active( $plugin_file ) ) : ?>
          <div class="welcome-panel-footer-wrapper">
              <footer class="welcome-panel-footer">
                  <a href="<?php echo esc_url( $activate_url ); ?>" class="button button-primary">
                      Activate WP Appointments
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

      /* hide the close button and empty widgets containers */
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

      .welcome-panel-column-container-one-col {
        width: var(--max-width);
        box-sizing: border-box;
        max-width: 100%;
        margin-inline: auto;
        padding: 0 32px 32px;
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

      #wpcontent #wpadminbar .wp-appointments-feedback:hover .ab-item,
      #wpcontent #wpadminbar .wp-appointments-feedback:active .ab-item,
      .welcome-panel-footer .button-primary:hover,
      .welcome-panel-footer .button-primary:active {
        background-color: var(--brand-color-light);
        color: white;
      }

      #wpcontent #wpadminbar .wp-appointments-feedback .ab-item {
        margin-right: 10px;
        padding-left: 34px;
        font-weight: 500;
        text-transform: uppercase;
        background-color: var(--brand-color-default);
        background-image: url("data:image/svg+xml,%3Csvg id='uuid-108c8467-2f60-4f27-9cc3-731fecd27c8f' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 51.44 51.44'%3E%3Cg id='uuid-0e84affd-ba30-440d-9b7b-52f64fe4c4f3'%3E%3Cpath d='m25.72,0C11.54,0,0,11.54,0,25.72s11.54,25.72,25.72,25.72,25.72-11.54,25.72-25.72S39.9,0,25.72,0Zm0,40.04c-7.9,0-14.33-6.43-14.33-14.32s6.43-14.33,14.33-14.33,14.33,6.43,14.33,14.33-6.43,14.32-14.33,14.32Z' fill='%23ffffff'/%3E%3Crect x='20.39' y='19.56' width='14.35' height='9.09' transform='translate(-8.97 26.55) rotate(-45)' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: 8px center;
        background-size: 20px;
      }

      .drawer {
        position: absolute;
        z-index: 10000;
        top: 0;
        right: 0;
        width: 85%;
        height: 100%;
        transition: transform 0.3s ease-in-out;
        transform: translateX(150%);
      }

      .drawer-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background: var(--brand-color-dark);
        box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
      }

      .drawer.is-open {
        transform: translateX(0);
      }

      .drawer-close {
        position: absolute;
        z-index: -1;
        left: -29px;
        top: 20px;
        border-radius: 3px 3px 0 0;
        padding: 5px 10px;
        border: 0;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 12px;
        color: white;
        transform: rotate(-90deg);
        transform-origin: bottom;
        background-color: var(--brand-color-dark);
        cursor: pointer;
        box-shadow: 0 0 30px rgb(0, 0, 0, 0.5);
      }

      @media (min-width: 769px) {
        .welcome-panel-footer {
          padding: 24px 48px;
        }

        .welcome-panel-column-container-one-col {
          padding: 0 48px 48px;
        }

        .drawer {
          max-width: 60%;
        }
      }

      @media (min-width: 1025px) {
        .drawer {
          max-width: 40%;
        }
      }
    </style>
	<?php
} );


add_action( 'admin_bar_menu', function ( $wp_admin_bar ) {
  $args = array(
      'id'     => 'wp-appointments-feedback',
      'title'  => 'Send Feedback',
      'href'   => '#',
      'parent' => 'top-secondary',
      'meta'   => array(
        'class' => 'wp-appointments-feedback js-feedback-link',
        'title' => 'Send Feedback',
      ),
  );
  $wp_admin_bar->add_node( $args );
} );

add_action( 'admin_footer', function () {
    ?>
    <div class="drawer js-feedback-drawer">
        <button type="button" class="drawer-close js-feedback-link">
            Close
        </button>
        <div class="drawer-content">
            <iframe data-tally-src="https://tally.so/embed/w518KZ?dynamicHeight=1" loading="lazy" width="100%"
                    height="1609"
                    frameborder="0" marginheight="0" marginwidth="0" title="WP Appointments - beta testing"></iframe>
            <script>var d = document, w = "https://tally.so/widgets/embed.js", v = function () {
                    "undefined" != typeof Tally ? Tally.loadEmbeds() : d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function (e) {
                        e.src = e.dataset.tallySrc
                    }))
                };
                if ("undefined" != typeof Tally) v(); else if (d.querySelector('script[src="' + w + '"]') == null) {
                    var s = d.createElement("script");
                    s.src = w, s.onload = v, s.onerror = v, d.body.appendChild(s);
                }
            </script>
        </div>
    </div>
    <script type="module">
        (function ($) {
            const $drawer = $('.js-feedback-drawer');
            const $buttons = $('.js-feedback-link');

            $(window).click(function() {
              $drawer.removeClass('is-open');
            });

            $buttons.on('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                $drawer.toggleClass('is-open');
            });

            $drawer.click(function(event){
              event.stopPropagation();
            });
        })(window.jQuery);
    </script>
    <?php
} );
