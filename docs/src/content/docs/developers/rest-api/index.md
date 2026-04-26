---
title: REST API
description: WP Appointments REST API reference.
---

All endpoints are under the `/wpappointments/v1/` namespace and require authentication (cookie or application password).

## Authentication

The API uses WordPress nonce-based authentication for logged-in users:

```js
import apiFetch from '@wordpress/api-fetch';

const appointments = await apiFetch({
  path: '/wpappointments/v1/appointments',
});
```

For external integrations, use WordPress application passwords.

## Response Format

All list endpoints return a standardized envelope:

```json
{
  "data": [...],
  "totalItems": 50,
  "totalPages": 5,
  "postsPerPage": 10,
  "currentPage": 1
}
```

## Endpoints

| Controller | Base Path | Description |
|------------|-----------|-------------|
| [Appointments](/developers/rest-api/appointments/) | `/appointments` | CRUD for appointments |
| [Bookables](/developers/rest-api/bookables/) | `/bookables` | CRUD for bookable entities |
| [Variants](/developers/rest-api/variants/) | `/variants` | CRUD for bookable variants |
| [Availability](/developers/rest-api/availability/) | `/availability` | Query availability slots |
| [Customers](/developers/rest-api/customers/) | `/customers` | CRUD for customers |
| [Settings](/developers/rest-api/settings/) | `/settings` | Plugin settings |
| [Bookable Types](/developers/rest-api/bookable-types/) | `/bookable-types` | List registered bookable types |
