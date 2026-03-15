# WP Appointments Monorepo

## Local Development

Prerequisites: [Docker](https://www.docker.com/), [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/)

```bash
# First-time setup (installs deps, starts WordPress, runs composer, builds assets)
pnpm run initialize

# Start dev server with hot reload
pnpm run dev
```

The dev site runs at http://localhost:8888 (admin: `admin` / `password`).
