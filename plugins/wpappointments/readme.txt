=== WP Appointments ===
Contributors: wppoland
Tags: appointments, booking, scheduling, calendar, reservations
Requires at least: 6.4
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 0.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Next-gen appointment scheduling for WordPress. Extensible, developer-friendly booking system with variant support.

== Description ==

WP Appointments is a modern appointment scheduling plugin for WordPress. It provides a full-featured booking system with bookable entities, service variants, availability management, and a beautiful admin interface built with React.

Whether you run a salon, clinic, consulting firm, or any service-based business, WP Appointments gives you the tools to manage your bookings directly from WordPress.

= Key Features =

* **Services & Variants** -- Create unlimited services with custom durations, pricing, categories, and variant support for flexible booking options.
* **Bookable Entities** -- Define resources that can be booked such as rooms, tables, equipment, or staff members. Entities support hierarchical nesting (e.g., location > room > seat) with inherited schedules.
* **Booking Flow** -- A complete customer-facing booking experience via a Gutenberg block. Customers pick a service, select an available time slot, and confirm their appointment.
* **Calendar & Availability** -- Visual calendar in the admin dashboard with real-time availability calculation. Define weekly schedules with multiple time slots per day.
* **Customer Management** -- Track customers, view their booking history, and manage accounts directly from the admin panel.
* **Email Notifications** -- Automatic email notifications for appointment creation, confirmation, cancellation, and updates with customizable templates.
* **REST API** -- Full REST API under the `wpappointments/v1` namespace for headless or custom integrations.

= Developer-Friendly =

* Hookable architecture -- extend functionality using WordPress actions and filters.
* PSR-4 autoloaded PHP codebase with strict typing.
* TypeScript/React frontend using `@wordpress/data` for state management.
* Extensible via add-on plugins -- premium features ship as separate packages.

= Free Features =

* Unlimited services and bookable entities.
* Full customer booking flow with Gutenberg block.
* Weekly schedule management with multiple time slots.
* Email notification templates.
* Customer management.
* REST API access.

== Installation ==

1. Upload the `wpappointments` folder to the `/wp-content/plugins/` directory, or install the plugin through the WordPress plugins screen.
2. Activate the plugin through the "Plugins" screen in WordPress.
3. Navigate to **WP Appointments** in the admin menu to configure your services, schedule, and settings.
4. Add the booking block to any page or post using the Gutenberg editor to enable customer-facing appointment booking.

== Frequently Asked Questions ==

= What PHP version is required? =

WP Appointments requires PHP 8.2 or higher. This ensures access to modern language features and better performance.

= Can I create multiple services with different durations? =

Yes. You can create unlimited services, each with its own duration, price, description, image, and category. Services also support variants for flexible booking options.

= What are bookable entities? =

Bookable entities represent resources that can be reserved -- rooms, tables, staff members, equipment, or any other bookable resource. Entities support hierarchical nesting and can inherit or override schedule settings from their parent.

= Is there a REST API available? =

Yes. WP Appointments exposes a full REST API under the `wpappointments/v1` namespace. You can manage appointments, services, entities, customers, and settings programmatically.

== Changelog ==

= 0.1.2 =
* Initial public release.
* Services with categories, variants, and custom attributes.
* Bookable entities with hierarchical nesting and schedule inheritance.
* Customer-facing booking flow via Gutenberg block.
* Admin calendar with availability management.
* Customer management.
* Email notifications with customizable templates.
* Full REST API.
