# WP Appointments - Development Guidelines

## Pre-commit Checks

Before committing any changes, always run these commands and ensure they pass:

```bash
pnpm run lint:js       # ESLint + Prettier for JS/TS
pnpm run check-types   # TypeScript type checking
pnpm run lint:php      # PHPCS for PHP (requires PHP or Docker)
pnpm run test          # Pest PHP tests (requires wp-env or WP test suite)
```

## Git Workflow

- **Never push directly to main.** Always create a feature branch and open a PR.
- Branch naming: use `feat/`, `fix/`, `docs/`, `chore/` prefixes. Never use `claude/` prefix.
- After creating a PR, wait for CodeRabbit review and CI checks before merging.
- Co-author line: `Co-Authored-By: wppoland.com <hello@wppoland.com>`
- Never sign commits as Claude or Cursor.

## CI Pipeline

CI runs on every PR to main:
- **PHP Lint (PHPCS)** — WordPress coding standards
- **JS Lint & Type Check** — ESLint + TypeScript `tsc --noEmit`
- **Build** — Webpack build verification
- **PHP Tests (Pest)** — WordPress integration tests with MySQL

## Plugin Metadata

- Plugin URI: `https://wpappointments.com/`
- Author URI: `https://wppoland.com`

## Tech Stack

- PHP 8.2+ with WordPress coding standards
- TypeScript/React frontend with `@wordpress/scripts`
- `@wordpress/data` (Redux) for state management
- React Hook Form for forms
- Valibot for schema validation
- pnpm workspaces + Lerna for monorepo
- Pest for PHP testing
