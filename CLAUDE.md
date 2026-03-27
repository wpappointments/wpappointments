# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WP Appointments is a WordPress appointment scheduling plugin. Monorepo with Turborepo + pnpm workspaces. PHP 8.2 backend, TypeScript/React frontend using WordPress packages. Versioning and publishing via Changesets (independent versioning per package).

**This is pre-release software with no public users.** Never write backwards-compatible code. No deprecation layers, no old-name re-exports, no fallback paths for old interfaces, no `_unused` parameter renames. When changing APIs, interfaces, or data structures — just change them directly and update all references. Delete old code outright.

## Commands

### Setup & Development
```bash
pnpm run initialize          # First-time setup (installs deps, starts WP, builds)
pnpm run dev                 # Start dev server with hot reload (starts wp-env + mailhog + webpack)
pnpm run start:wp            # Start WordPress only
pnpm run stop                # Stop all services
```

Dev site: http://localhost:8888 (admin: `admin` / `password`)

### Building
```bash
pnpm run build                              # Full build (all packages via Turborepo)
pnpm -C plugins/wpappointments build        # Build plugin assets only
pnpm -C plugins/wpappointments css-types    # Generate CSS module type declarations
```

### Documentation
```bash
pnpm -C docs dev              # Start docs dev server (localhost:4321)
pnpm -C docs build            # Build docs static site
pnpm -C docs preview          # Preview production build
pnpm -C docs generate         # Auto-generate TypeDoc + hooks reference pages
pnpm turbo docs:generate      # Generate via Turborepo (respects cache/inputs)
```

### Testing
```bash
pnpm test                                    # PHP tests (Pest) via wp-env with coverage
pnpm -C plugins/wpappointments test:e2e      # Playwright E2E tests
```

PHP tests run inside wp-env Docker container. Test files: `plugins/wpappointments/tests/php/` (suffix: `Test.php`). Framework: Pest (PHPUnit wrapper).

### Linting & Type Checking
```bash
pnpm run lint              # JS + PHP lint
pnpm run lint:js           # ESLint via wp-scripts
pnpm run lint:php          # PHPCS (WordPress coding standards)
pnpm run format            # Auto-format JS + PHP
pnpm run format:php        # PHP auto-fix (phpcbf)
pnpm run check-types       # TypeScript type check
```

PHP linting/formatting runs inside wp-env: `pnpm run phpcs` / `pnpm run phpcbf`.

### Composer
```bash
pnpm run dump-autoload     # Regenerate PSR-4 autoload (runs in wp-env)
```

After adding new PHP classes, run dump-autoload for PSR-4 to pick them up.

## Architecture

### Monorepo Structure
- `plugins/wpappointments/` — Main plugin (all core code lives here)
- `plugins/other-plugin/` — Dev/test helper plugin
- `premium/` — Git submodule for premium add-ons (`wpappointments/wpappointments-premium`, private)
- `.claude/` — Git submodule for Claude Code workspace (`wpappointments/claude`, private)
- `tools/testing/` — Shared test bootstrap and utilities
- `packages/` — Node packages workspace (currently empty)

### Private Submodules

`premium/` and `.claude/` are private git submodules. Not required for building or contributing — only for internal team members.

```bash
git submodule update --init --recursive   # Initialize all submodules (first time)
git submodule update                      # Sync to the commit the main repo points to
git submodule update --remote             # Pull latest from submodule remotes
```

Pushing submodule changes requires two steps — push the submodule itself, then update the pointer in the main repo:

```bash
cd .claude && git add -A && git commit -m "msg" && git push origin main && cd ..
git add .claude && git commit -m "Update .claude submodule"
```

The `.claude/` submodule contains plans, tasks, thoughts, and slash commands (`/thoughts`, `/epic`, `/breakdown`, `/develop`). See `.claude/README.md` for full workflow docs.

### PHP Backend (`plugins/wpappointments/src/`)
- **Namespace:** `WPAppointments\` with PSR-4 autoloading
- **`Api/Endpoints/`** — REST controllers (namespace `/wpappointments/v1/`), extend base `Controller` class
- **`Core/`** — Plugin bootstrap: post type registration, capabilities, activation/deactivation, `Singleton` base class
- **`Data/Model/`** — Data models (Appointment, Customer, Bookable, Entity)
- **`Data/Query/`** — Query classes for fetching/filtering posts
- **`Notifications/`** — Email notification system with template variables
- **`Utils/`** — Date, Schedule, Availability helpers
- **Custom post types:** `wpa-appointment`, `wpa-schedule`, `wpa-bookable`, `wpa-bookable-variant`

### TypeScript Frontend (`plugins/wpappointments/assets/`)
- **`backend/`** — Admin UI (React). Pages: Dashboard, Calendar, Customers, Services, Entities, Settings
- **`backend/store/`** — `@wordpress/data` store with actions, reducers, selectors, resolvers, controls
- **`backend/api/`** — API client functions using `@wordpress/api-fetch`
- **`frontend/`** — Customer-facing booking flow
- **`gutenberg/blocks/`** — Booking flow Gutenberg block
- **Path aliases** in tsconfig: `~/backend/*`, `~/frontend/*`, `~/blocks/*`, `~/images/*`
- **CSS Modules** with camelCase exports (generated `.d.ts` via happy-css-modules)
- **Form handling:** React Hook Form + Valibot for validation

### Key Patterns
- REST API returns standardized envelopes with pagination (`totalItems`, `totalPages`, `postsPerPage`, `currentPage`)
- Frontend state management via `@wordpress/data` Redux stores (not plain React state)
- Custom capabilities: `wpa_manage_appointments`, etc.

### WordPress Plugin Coding Rules

**All PHP code MUST follow the rules in [`.claude/WP_CODING_RULES.md`](.claude/WP_CODING_RULES.md).** This covers input sanitization, output escaping, database safety, nonces, capabilities, and wp.org compliance. Read that file before writing any PHP.

## CI

GitHub Actions runs on push/PR to main: PHP lint (PHPCS), JS lint + type check, build, PHP tests (Pest via wp-env).
