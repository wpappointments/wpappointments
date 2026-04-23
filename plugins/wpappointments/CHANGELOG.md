# @wpappointments/wpappointments

## 0.2.0

### Minor Changes

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Add Bookable Entities system with admin UI, data model, and DataViews table. Overhaul Services with standalone admin page, onboarding wizard step, categories, image support, and active/inactive toggle.

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Add extensibility APIs — SlotFill support in layout header, Gutenberg block hooks for addon plugins, shared UI components, admin page registration API, and mountAddonPage helper.

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Add full i18n support — wrap 80+ strings for translation, add textdomain loading, generate .pot file, and add Polish .po/.mo template.

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Add email notifications for appointment lifecycle events (created, confirmed, cancelled, no-show) with per-event notification settings and MailHog setup for local testing.

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Add complete permission system with MANAGE_CUSTOMERS capability, filter hooks, and tests.

### Patch Changes

- [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5) Thanks [@dawidurbanski](https://github.com/dawidurbanski)! - Fix query injection, mass assignment, IDOR, and input sanitization vulnerabilities. Fix permission checks to use manage_options. Improve accessibility for SlideOut, Calendar, and forms.

- Updated dependencies [[`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5), [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5), [`4c87062`](https://github.com/wpappointments/wpappointments/commit/4c870623c8887aa07de6eda233ab2db0636867f5)]:
    - @wpappointments/components@0.2.0
    - @wpappointments/data@0.2.0
