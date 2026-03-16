# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WP Appointments is a WordPress appointment scheduling plugin. Monorepo with Lerna + pnpm workspaces. PHP 8.2 backend, TypeScript/React frontend using WordPress packages.

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
pnpm run build                              # Full build (all packages via Lerna)
pnpm -C plugins/wpappointments build        # Build plugin assets only
pnpm -C plugins/wpappointments css-types    # Generate CSS module type declarations
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
- `premium/` — Git submodule for premium add-ons
- `tools/testing/` — Shared test bootstrap and utilities
- `packages/` — Node packages workspace (currently empty)

### PHP Backend (`plugins/wpappointments/src/`)
- **Namespace:** `WPAppointments\` with PSR-4 autoloading
- **`Api/Endpoints/`** — REST controllers (namespace `/wpappointments/v1/`), extend base `Controller` class
- **`Core/`** — Plugin bootstrap: post type registration, capabilities, activation/deactivation, `Singleton` base class
- **`Data/Model/`** — Data models (Appointment, Customer, Service, Entity)
- **`Data/Query/`** — Query classes for fetching/filtering posts
- **`Notifications/`** — Email notification system with template variables
- **`Utils/`** — Date, Schedule, Availability helpers
- **Custom post types:** `wpa-appointment`, `wpa-schedule`, `wpa-service`, `wpa-entity`

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
- PHP classes use the Singleton pattern (`Core\Singleton` base class)
- REST API returns standardized envelopes with pagination (`totalItems`, `totalPages`, `postsPerPage`, `currentPage`)
- Frontend state management via `@wordpress/data` Redux stores (not plain React state)
- Custom capabilities: `wpa_manage_appointments`, etc.

## CI

GitHub Actions runs on push/PR to main: PHP lint (PHPCS), JS lint + type check, build, PHP tests (Pest via wp-env).
