# WP.org submission smoke-test checklist

Run through this on a **fresh WordPress install** before producing the wp.org ZIP.
Everything should work without configuration beyond the onboarding wizard.

Estimated time: 30–45 minutes.

---

## Prep

- [ ] Pull latest `main` and build: `pnpm install && pnpm run build`.
- [ ] Start a clean wp-env: `pnpm run clean && pnpm run start:wp`.
- [ ] Verify Plugin Check is green: `pnpm run check:wporg` → 0 errors, ≤ 2 "wp trademark" warnings only.
- [ ] Activate the plugin. The admin should redirect you straight to the onboarding wizard.

## Onboarding wizard

- [ ] Welcome screen renders with the new branding (no "WP Appointments" in the title) and a one-sentence description of the plugin.
- [ ] Each step saves without console errors.
- [ ] Schedule step: `Continue` button stays disabled until schedules resolve. No duplicate schedule is created in `/wp-json/wpappointments/v1/schedules`.
- [ ] AllSet screen renders without the removed "Watch video" link and without any `wpappointments.com` URLs.
- [ ] `Go to dashboard` lands on the main plugin page.

## Admin flows

- [ ] **Dashboard** renders. No console errors.
- [ ] **Calendar** renders the current week. Clicking an empty slot opens the create-appointment slideout.
- [ ] Create an appointment manually (admin). Verify `entity_id` post meta is set (e.g. via `wp post meta list <id>`).
- [ ] Edit an appointment. Status change from `pending` → `confirmed` fires the `wpappointments_appointment_confirmed` action (check MailHog for confirmation email at http://localhost:8025).
- [ ] Cancel the appointment. Customer receives a cancellation email.
- [ ] **Customers** page lists the customer created from the appointment.
- [ ] **Services** page lets you create a second service and associate a schedule.
- [ ] **Settings** → all tabs open, each form saves.

## Customer-facing booking flow

- [ ] Create a page, insert the **Booking Flow** block, publish.
- [ ] Visit the page as an anonymous visitor (incognito window).
- [ ] Calendar loads. No console errors. Available days are clickable.
- [ ] Pick a day, pick a slot, fill the form, submit. Booking succeeds.
- [ ] Admin receives the creation email. Customer receives the confirmation template.
- [ ] The slot you just booked is now **disabled** for a second anonymous booking in the same window. Switching days clears the previous selection (regression check for #412).
- [ ] Book with a **second service** (different entity) at the same time. Should succeed — the slot is not blocked for another entity (regression check for #425).

## OOO

- [ ] Add an out-of-office date in **Settings → Out of Office**.
- [ ] Visit the booking page; that date is shown as unavailable.
- [ ] Log out. Visit the booking page as an anonymous user; the date is still unavailable (regression check for #423).

## Uninstall path

- [ ] In the plugin settings, leave the default uninstall behavior (preserve data).
- [ ] Deactivate and delete the plugin via **Plugins → Installed Plugins**.
- [ ] Re-install the plugin. All your data is still there (options, appointments, customers).
- [ ] Repeat: enable the **Delete data on uninstall** option, deactivate, delete.
- [ ] Re-install. Everything is back to a fresh install — no leftover options, no CPT entries, no custom caps on roles.

## Error scenarios

- [ ] Submit the public booking form with an empty `date` — API returns 422 with `invalid_date`.
- [ ] Call the admin `/appointments` endpoint as an unauthenticated user — 401/403.
- [ ] Call a public endpoint with SQL-injection-ish params (`' OR 1=1--`) — returns validation error, no 500, no data leakage.

## i18n sanity

- [ ] Switch WordPress to Polish (`pl_PL`). Admin UI shows translated strings.
- [ ] Switch back to English. Strings revert.

## Final checks

- [ ] All 5 wp.org listing screenshots captured (run the **WP.org listing screenshots** GitHub Action manually and download the `wporg-screenshots` artifact, or run `pnpm -C plugins/appointments-booking test:e2e:wporg-screenshots` locally). Save the PNGs to `plugins/appointments-booking/assets/` per `WPORG_LISTING.md`.
- [ ] Banner (772×250 and 1544×500) and icon (128×128 and 256×256) PNGs present.
- [ ] `readme.txt` short description ≤ 150 chars and matches the listing blurb.
- [ ] Changelog entry for the current version exists in `readme.txt`.
- [ ] `Stable tag:` in `readme.txt` matches `Version:` in `appointments-booking.php`.

## Build the submission ZIP

- [ ] Run `pnpm release:wporg`. Output: `plugins/appointments-booking/appointments-booking.zip`.
- [ ] Unzip into a fresh WordPress install on a separate machine and re-run the smoke flow above. The ZIP must work without dev tooling.

---

If anything on this list fails, fix it before submission. If something is ambiguous (e.g. reviewer requests something that contradicts this list), the reviewer's current policy wins — update this checklist after the review.
