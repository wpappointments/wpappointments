=== Appstip Booking ===
Contributors: dawidurbanski
Tags: appointments, booking, scheduling, calendar
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 8.1
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A focused foundation for appointment management in WordPress.

== Description ==

Appstip Booking is a lightweight appointment management plugin for WordPress. The 0.1 release establishes a minimal, secure foundation: a custom post type for storing appointments and a settings page for configuring the default appointment duration.

Future releases will add booking workflows, customer-facing forms, calendar views, and notifications.

**Features in 0.1.0**

* Appointments custom post type with a dedicated admin menu.
* Settings page for the default appointment duration (5–480 minutes).
* Translation-ready (text domain: `appstip-booking`).
* Clean uninstall removes plugin options and stored appointments.

== Installation ==

1. Upload the `appstip-booking` folder to `/wp-content/plugins/` or install through the **Plugins → Add New** screen.
2. Activate the plugin via the **Plugins** menu in WordPress.
3. Configure the default appointment duration under **Appointments → Settings**.

== Frequently Asked Questions ==

= What does the plugin do today? =

It registers an Appointments custom post type and exposes one setting for the default appointment duration. Booking workflows, customer-facing forms, and integrations land in subsequent releases.

= Does it require external services or third-party APIs? =

No. Everything runs on your WordPress instance — no external calls.

= Is the plugin translation-ready? =

Yes. The text domain is `appstip-booking` and translation files belong in the `languages` directory.

== Changelog ==

= 0.1.0 =
* Initial release: Appointments custom post type and default duration setting.

== Upgrade Notice ==

= 0.1.0 =
Initial release.
