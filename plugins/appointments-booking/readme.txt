=== Appointments Booking by WP Appointments ===
Contributors: motylanogha, dawidurbanski
Tags: appointments, booking, scheduling, calendar, reservations
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 0.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Modern appointment scheduling for WordPress — services, variants, bookable resources, availability, email notifications, and a booking block.

== Description ==

Appointments Booking by WP Appointments is a modern appointment scheduling plugin for WordPress. It ships a full-featured booking system with bookable entities, service variants, availability management, and an admin interface built with React.

Whether you run a salon, clinic, consulting firm, coaching practice, or any service-based business, this plugin gives you the tools to manage your bookings directly from WordPress — no external SaaS required.

= Key Features =

* **Services & Variants** — Create unlimited services with custom durations, pricing, categories, and variant support for flexible booking options.
* **Bookable Entities** — Define resources that can be booked such as rooms, tables, equipment, or staff members. Entities support hierarchical nesting (e.g., location → room → seat) with inherited schedules.
* **Booking Flow Block** — A complete customer-facing booking experience via a Gutenberg block. Customers pick a service, select an available time slot, and confirm their appointment.
* **Calendar & Availability** — Visual admin calendar with real-time availability calculation. Define weekly schedules with multiple time slots per day.
* **Customer Management** — Track customers, view their booking history, and manage accounts directly from the admin panel.
* **Email Notifications** — Automatic email notifications for appointment creation, confirmation, cancellation, and updates, with customizable templates and merge tags.
* **REST API** — Full REST API for headless setups and custom integrations.
* **Translation-Ready** — Ships with translations for German, Spanish, French, Italian, Japanese, Dutch, Polish, Portuguese (Brazil), Russian, and Chinese (Simplified).

= Developer-Friendly =

* Hookable architecture — extend functionality using WordPress actions and filters.
* PSR-4 autoloaded PHP codebase with strict typing.
* TypeScript/React frontend using `@wordpress/data` for state management.
* Extensible via add-on plugins — advanced features ship as separate packages.

= Free Version Includes =

* Unlimited services and bookable entities.
* Full customer booking flow with a Gutenberg block.
* Weekly schedule management with multiple time slots per day.
* Admin calendar with availability overview.
* Customizable email notification templates.
* Customer management.
* REST API access.
* Multi-language interface.

== Installation ==

1. Upload the `appointments-booking` folder to the `/wp-content/plugins/` directory, or install the plugin through the WordPress Plugins screen.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Navigate to **Appointments** in the admin menu to configure your services, schedule, and settings.
4. Add the **Booking Flow** block to any page or post using the block editor to enable customer-facing appointment booking.

== Frequently Asked Questions ==

= What PHP version is required? =

The plugin requires PHP 8.2 or higher. This ensures access to modern language features and better performance.

= What WordPress version is required? =

WordPress 6.4 or higher. The plugin is tested up to WordPress 6.9.

= Can I create multiple services with different durations? =

Yes. You can create unlimited services, each with its own duration, price, description, image, and category. Services also support variants for flexible booking options.

= What are bookable entities? =

Bookable entities represent resources that can be reserved — rooms, tables, staff members, equipment, or any other bookable resource. Entities support hierarchical nesting and can inherit or override schedule settings from their parent.

= Can customers cancel or reschedule their own appointments? =

Cancellation and self-service rescheduling via customer-facing pages are part of the roadmap for a future release. Admins can cancel, confirm, or reschedule appointments from the admin calendar today.

= Is there a REST API available? =

Yes. The plugin exposes a full REST API so you can manage appointments, services, entities, customers, and settings programmatically — ideal for headless setups and third-party integrations.

= Does the plugin send email notifications? =

Yes. Admin and customer emails are sent automatically on appointment creation, update, confirmation, and cancellation. Subject lines and message bodies are fully customizable with merge tags like `{customer_name}`, `{service}`, `{date}`, `{time}`, and `{duration}`.

= Does this plugin work with any theme? =

Yes. The booking flow is rendered via a Gutenberg block, which inherits your theme's styling. It also works inside full-site editing (FSE) themes and classic themes that support the block editor.

= Is the plugin translation-ready? =

Yes. All user-facing strings use the `appointments-booking` text domain and ready-made translations are bundled for 10 locales. Contributions are welcome via WordPress.org's translation platform.

= Does the booking flow work on mobile? =

Yes. The customer-facing booking flow is responsive and uses touch-friendly slot selection. It works with FSE themes and classic themes that support the block editor.

= How are timezones handled? =

Times are stored and displayed in the site's WordPress timezone (Settings → General → Timezone). Customers and admins see the same wall-clock times.

= What happens to my data on uninstall? =

By default, uninstall preserves your data so a re-install restores everything. To wipe everything, enable "Delete data on uninstall" in Settings → General before deleting the plugin.

= Where can I find premium add-ons? =

See the plugin's Help → Premium page after activation, or visit the documentation site for the current add-on catalog and installation instructions.

== Screenshots ==

1. Admin calendar showing upcoming appointments.
2. Service configuration with duration, price, and variants.
3. Customer-facing booking flow (Gutenberg block) with time-slot selection.
4. Weekly schedule editor with per-day time slots.
5. Email notification template editor with merge tags.

== Changelog ==

= 0.2.0 =
* Renamed plugin slug to `appointments-booking` for WordPress.org compatibility.
* Consolidated email notification system with a unified editor UI.
* Performance improvements: eliminated ~741 KB of shared frontend script and resolved N+1 queries on the admin dashboard.
* New availability layer engine supporting location, entity, and schedule overrides.
* Bookable entities with hierarchical nesting and schedule inheritance.
* Bookable type registry for extensible booking models (services, tables, rooms, etc.).
* Improved REST API coverage and response envelopes.
* Translation updates for all bundled locales.

= 0.1.2 =
* Initial public release.
* Services with categories, variants, and custom attributes.
* Customer-facing booking flow via Gutenberg block.
* Admin calendar with availability management.
* Customer management.
* Email notifications with customizable templates.
* Full REST API.

== Upgrade Notice ==

= 0.2.0 =
This release renames the plugin slug to `appointments-booking` to comply with WordPress.org trademark rules. Existing install paths, menu URLs, and the plugin text domain have changed. After updating, re-activate the plugin if the admin menu does not appear.
