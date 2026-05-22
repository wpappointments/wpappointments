# @wpappointments/wpappointments

## 1.0.0

### Major Changes

- [#453](https://github.com/wpappointments/wpappointments/pull/453) [`5353d45`](https://github.com/wpappointments/wpappointments/commit/5353d45770a00ca6f55caff61e29b68b0eb990ba) Thanks [@wppoland](https://github.com/wppoland)! - v1.0.0 — General Availability and wordpress.org submission ready

    **Plugin renamed for wp.org compliance.** Display name is now "Appointments Booking" (was "WP Appointments") and the slug is `appstip-appointments`. Internal namespace `WPAppointments\*`, hooks `wpappointments_*`, and the `@wordpress/data` store name are intentionally unchanged so existing addons continue to work — wp.org's trademark rule applies only to the public plugin name and slug.

    **Granular CRUD capabilities.** The 6 coarse `wpa_manage_*` caps were replaced with 22 granular `wpa_view_*`, `wpa_create_*`, `wpa_edit_*`, `wpa_delete_*` caps across appointments, bookables, customers, services, schedules, and settings. Roles need to be re-mapped on upgrade.

    **Mobile + a11y polish on the booking flow.** Calendar wrapper is now fluid (no horizontal overflow at 375 / 768 px). Time-slot buttons and customer form inputs hit WCAG 2.5.5 Level AAA (≥44 px). New mobile e2e suite is the regression net.

    **i18n alignment.** Text-domain switched from `wpappointments` to `appstip-appointments` everywhere user-facing strings are wrapped. .pot regenerated (197 strings); .po headers fixed across 10 locales (de, es, fr, it, ja, nl, pl, pt-BR, ru, zh-CN); .mo binaries rebuilt.

    **Customer-facing FAQ.** New `/help/faq` page (8 grouped sections, ~22 Q&As) plus 5 new entries in `readme.txt` covering mobile, timezones, uninstall data behavior, premium discovery, and multi-service handling.

    **wp.org submission scaffolding.** `pnpm release:wporg` produces a 635 KB submission ZIP (production composer + built assets, dev files stripped via `.zipignore`). New manual GitHub Action `WP.org listing screenshots` generates and uploads the 5 listing PNGs as a downloadable artifact. Plugin Check passes with 0 errors and 0 warnings.

    **Bug fixes that landed in v1**
    - Onboarding wizard guards Continue until schedules resolve so the default schedule isn't duplicated ([#411](https://github.com/wpappointments/wpappointments/issues/411))
    - Booking flow clears stale datetime when the selected day changes ([#412](https://github.com/wpappointments/wpappointments/issues/412))
    - Slot blocking is scoped to the booked entity — booking service A no longer blocks the same slot for service B ([#425](https://github.com/wpappointments/wpappointments/issues/425))
    - OOO resolves the core entity for unauthenticated booking visitors ([#422](https://github.com/wpappointments/wpappointments/issues/422))
    - Schedule editor preserves custom slots when toggling all-day ([#420](https://github.com/wpappointments/wpappointments/issues/420))
    - Holidays: only enabled holidays claim ownership of a ref, so the same ref can be enabled independently in another group ([#409](https://github.com/wpappointments/wpappointments/issues/409))

    **Codebase hygiene**
    - All `useSelect()` calls use the hook-scoped `select` parameter ([#410](https://github.com/wpappointments/wpappointments/issues/410), 21 files)
    - CSS Modules use camelCase selectors in `BookingFlowMultiStep` and `OpeningHoursDayOfWeek` ([#408](https://github.com/wpappointments/wpappointments/issues/408), [#431](https://github.com/wpappointments/wpappointments/issues/431))
    - Store TS imports use the `~/backend/*` path alias ([#429](https://github.com/wpappointments/wpappointments/issues/429), [#430](https://github.com/wpappointments/wpappointments/issues/430))
    - Shared packages no longer use `*` for peer/dev dependency ranges ([#427](https://github.com/wpappointments/wpappointments/issues/427))
    - `/holidays` endpoints document why they skip the standard pagination envelope ([#424](https://github.com/wpappointments/wpappointments/issues/424))

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
