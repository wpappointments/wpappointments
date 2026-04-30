---
"@wpappointments/wpappointments": major
"@wpappointments/other-plugin": major
---

v1.0.0 — General Availability and wordpress.org submission ready

**Plugin renamed for wp.org compliance.** Display name is now "Appointments Booking" (was "WP Appointments") and the slug is `appointments-booking`. Internal namespace `WPAppointments\*`, hooks `wpappointments_*`, and the `@wordpress/data` store name are intentionally unchanged so existing addons continue to work — wp.org's trademark rule applies only to the public plugin name and slug.

**Granular CRUD capabilities.** The 6 coarse `wpa_manage_*` caps were replaced with 22 granular `wpa_view_*`, `wpa_create_*`, `wpa_edit_*`, `wpa_delete_*` caps across appointments, bookables, customers, services, schedules, and settings. Roles need to be re-mapped on upgrade.

**Mobile + a11y polish on the booking flow.** Calendar wrapper is now fluid (no horizontal overflow at 375 / 768 px). Time-slot buttons and customer form inputs hit WCAG 2.5.5 Level AAA (≥44 px). New mobile e2e suite is the regression net.

**i18n alignment.** Text-domain switched from `wpappointments` to `appointments-booking` everywhere user-facing strings are wrapped. .pot regenerated (197 strings); .po headers fixed across 10 locales (de, es, fr, it, ja, nl, pl, pt-BR, ru, zh-CN); .mo binaries rebuilt.

**Customer-facing FAQ.** New `/help/faq` page (8 grouped sections, ~22 Q&As) plus 5 new entries in `readme.txt` covering mobile, timezones, uninstall data behavior, premium discovery, and multi-service handling.

**wp.org submission scaffolding.** `pnpm release:wporg` produces a 635 KB submission ZIP (production composer + built assets, dev files stripped via `.zipignore`). New manual GitHub Action `WP.org listing screenshots` generates and uploads the 5 listing PNGs as a downloadable artifact. Plugin Check passes with 0 errors and 0 warnings.

**Bug fixes that landed in v1**
- Onboarding wizard guards Continue until schedules resolve so the default schedule isn't duplicated (#411)
- Booking flow clears stale datetime when the selected day changes (#412)
- Slot blocking is scoped to the booked entity — booking service A no longer blocks the same slot for service B (#425)
- OOO resolves the core entity for unauthenticated booking visitors (#422)
- Schedule editor preserves custom slots when toggling all-day (#420)
- Holidays: only enabled holidays claim ownership of a ref, so the same ref can be enabled independently in another group (#409)

**Codebase hygiene**
- All `useSelect()` calls use the hook-scoped `select` parameter (#410, 21 files)
- CSS Modules use camelCase selectors in `BookingFlowMultiStep` and `OpeningHoursDayOfWeek` (#408, #431)
- Store TS imports use the `~/backend/*` path alias (#429, #430)
- Shared packages no longer use `*` for peer/dev dependency ranges (#427)
- `/holidays` endpoints document why they skip the standard pagination envelope (#424)
