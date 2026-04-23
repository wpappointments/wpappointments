---
title: Appointments
description: CRUD endpoints for managing appointment records.
---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/appointments` | List all appointments |
| GET | `/wpappointments/v1/appointments/upcoming` | List upcoming appointments |
| POST | `/wpappointments/v1/appointments` | Create an appointment (admin) |
| POST | `/wpappointments/v1/public/appointments` | Create an appointment (public) |
| PUT/PATCH | `/wpappointments/v1/appointments/{id}` | Update an appointment |
| PUT/PATCH | `/wpappointments/v1/appointments/{id}/cancel` | Cancel an appointment |
| PUT/PATCH | `/wpappointments/v1/appointments/{id}/confirm` | Confirm an appointment |
| DELETE | `/wpappointments/v1/appointments/{id}` | Delete an appointment |

All endpoints except `POST /public/appointments` require the `wpa_manage_appointments` capability.

---

## GET /appointments

List all appointments with optional pagination and filtering.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | object | No | Query filter object passed to `AppointmentsQuery::all()` |

### Response

```json
{
  "status": "success",
  "message": "Appointments fetched successfully",
  "data": {
    "appointments": [
      {
        "id": 1,
        "service": "Haircut",
        "status": "confirmed",
        "timestamp": 1711036800,
        "duration": 60,
        "customerId": 5,
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        }
      }
    ],
    "totalItems": 50,
    "totalPages": 5,
    "postsPerPage": 10,
    "currentPage": 1
  }
}
```

---

## GET /appointments/upcoming

List upcoming (future) appointments.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | object | No | Query filter object passed to `AppointmentsQuery::upcoming()` |

### Response

Same shape as `GET /appointments`.

---

## POST /appointments

Create an appointment as an admin user.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | Yes | Appointment date/time string (parseable by `rest_parse_date`) |
| service | string | Yes | Service name (used as appointment title) |
| duration | integer | Yes | Duration in minutes |
| customer | object | No | Customer data object (name, email, phone) |
| customerId | integer | No | Existing customer user ID |
| status | string | No | Appointment status (e.g. `confirmed`, `pending`, `cancelled`) |

### Response

```json
{
  "status": "success",
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "id": 1,
      "service": "Haircut",
      "status": "confirmed",
      "timestamp": 1711036800,
      "duration": 60,
      "customerId": 5,
      "customer": { "name": "John Doe", "email": "john@example.com", "phone": "+1234567890" }
    }
  }
}
```

---

## POST /public/appointments

Create an appointment from the public booking form. No authentication required.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| date | string | Yes | Appointment date/time string |
| customer | object | Yes | Customer data (name, email, phone) |
| createAccount | boolean | No | Whether to create a WordPress user account for the customer |
| password | string | No | Password for the new account (only when `createAccount` is true) |

Duration, status, and service are resolved from plugin settings (`defaultLength`, `defaultStatus`, and the default service).

### Response

Same shape as `POST /appointments`.

---

## PUT/PATCH /appointments/{id}

Update an existing appointment.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID (URL parameter) |
| date | string | No | Updated date/time |
| service | string | No | Updated service name |
| duration | integer | No | Updated duration in minutes |
| status | string | No | Updated status |
| customer | object | No | Updated customer data |
| customerId | integer | No | Updated customer user ID |

### Response

```json
{
  "status": "success",
  "message": "Appointment updated successfully",
  "data": {
    "appointment": { ... }
  }
}
```

---

## PUT/PATCH /appointments/{id}/cancel

Cancel an appointment by setting its status to cancelled.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Appointment cancelled successfully",
  "data": {
    "appointmentId": 1
  }
}
```

---

## PUT/PATCH /appointments/{id}/confirm

Confirm a pending appointment.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Appointment confirmed successfully",
  "data": {
    "appointmentId": 1
  }
}
```

---

## DELETE /appointments/{id}

Permanently delete an appointment.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Appointment ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Appointment deleted successfully",
  "data": {
    "appointmentId": 1
  }
}
```
