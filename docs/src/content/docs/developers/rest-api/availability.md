---
title: Availability
description: Endpoints for querying appointment availability slots and bookable entity availability.
---

There are two availability systems: the legacy **schedule-based availability** (used by the original booking flow) and the newer **bookable availability** (used by the bookable entity system).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/availability` | Get month-level day availability |
| GET | `/wpappointments/v1/calendar-availability` | Get calendar slot availability |
| GET | `/wpappointments/v1/bookable-availability/{variant_id}` | Get effective availability for a variant |
| GET | `/wpappointments/v1/bookables/{entity_id}/availability` | Get availability for all variants of an entity |

All endpoints are publicly accessible (no authentication required).

---

## GET /availability

Get per-day availability for a given month. Returns which days have open slots.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| currentMonth | integer | Yes | Month number (1-12) |
| currentYear | integer | Yes | Four-digit year |
| timezone | string | No | IANA timezone string (e.g. `Europe/Warsaw`) |

### Response

```json
{
  "status": "success",
  "message": "Month availability fetched successfully",
  "data": {
    "availability": {
      "month": {
        "2026-03-01": true,
        "2026-03-02": false,
        "2026-03-03": true
      }
    }
  }
}
```

Each key is a date string and the value indicates whether that day has available slots.

---

## GET /calendar-availability

Get detailed slot-level availability for a calendar view. Used by the front-end booking calendar.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| calendar | string | No | JSON-encoded calendar data object |
| timezone | string | No | IANA timezone string |
| trim | string | No | Set to `"true"` to trim empty days from the response |

### Response

```json
{
  "status": "success",
  "message": "Calendar availability fetched successfully",
  "data": {
    "availability": { ... }
  }
}
```

The response shape depends on the calendar data provided and the schedule configuration.

---

## GET /bookable-availability/{variant_id}

Get the effective availability for a specific bookable variant. Combines the variant's schedule, buffer times, and existing appointments to compute open slots.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| variant_id | integer | Yes | Variant ID (URL parameter) |
| start_date | string | No | Start of the date range to query |
| end_date | string | No | End of the date range to query |

### Response

```json
{
  "status": "success",
  "message": "Availability fetched successfully",
  "data": {
    "availability": { ... }
  }
}
```

The response is computed by `AvailabilityEngine::get_effective_availability()` and contains the resolved availability data for the requested date range.

---

## GET /bookables/{entity_id}/availability

Get availability for all variants of a bookable entity at once. Returns each variant with its computed availability.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Bookable entity ID (URL parameter) |
| start_date | string | No | Start of the date range to query |
| end_date | string | No | End of the date range to query |

### Response

```json
{
  "status": "success",
  "message": "Entity availability fetched successfully",
  "data": {
    "variants": [
      {
        "variant": {
          "id": 20,
          "parentId": 10,
          "name": "Deep Tissue Massage — 60",
          "active": true,
          "attributeValues": { "Duration": "60" },
          "overrides": [],
          "duration": 60,
          "scheduleId": 3,
          "bufferBefore": 0,
          "bufferAfter": 0,
          "minLeadTime": 0,
          "maxLeadTime": 0,
          "meta": { ... }
        },
        "availability": { ... }
      }
    ]
  }
}
```
