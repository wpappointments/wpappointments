---
title: Customers
description: CRUD endpoints for managing customer user accounts.
---

Customers are WordPress users with the `wpa-customer` role.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/customers` | List all customers |
| POST | `/wpappointments/v1/customers` | Create a customer |
| PUT/PATCH | `/wpappointments/v1/customers/{id}` | Update a customer |
| DELETE | `/wpappointments/v1/customers/{id}` | Delete a customer |

All endpoints require the `wpa_manage_customers` capability.

---

## GET /customers

List all customers with optional pagination.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | object | No | Query filter object passed to `CustomersQuery::all()` |

### Response

```json
{
  "status": "success",
  "message": "Customers fetched successfully",
  "data": {
    "customers": [
      {
        "id": 5,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "created": "2026-01-15 10:30:00",
        "updated": "2026-01-15 10:30:00"
      }
    ],
    "totalItems": 25,
    "totalPages": 3,
    "postsPerPage": 10,
    "currentPage": 1
  }
}
```

---

## POST /customers

Create a new customer. A WordPress user account with the `wpa-customer` role is created.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Customer display name |
| email | string | Yes | Email address (also used as username) |
| phone | string | No | Phone number |
| password | string | No | Account password (auto-generated if omitted) |

### Response

```json
{
  "status": "success",
  "message": "Customer created successfully",
  "data": {
    "customer": {
      "id": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "created": "2026-03-21 14:00:00",
      "updated": "2026-03-21 14:00:00"
    }
  }
}
```

---

## PUT/PATCH /customers/{id}

Update an existing customer's profile.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Customer user ID (URL parameter) |
| name | string | No | Updated display name |
| email | string | No | Updated email address |
| phone | string | No | Updated phone number |

### Response

```json
{
  "status": "success",
  "message": "Customer updated successfully",
  "data": {
    "customer": {
      "id": 5,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+0987654321",
      "created": "2026-01-15 10:30:00",
      "updated": "2026-01-15 10:30:00"
    }
  }
}
```

---

## DELETE /customers/{id}

Permanently delete a customer user account.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Customer user ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Customer deleted successfully",
  "data": {
    "id": 5
  }
}
```
