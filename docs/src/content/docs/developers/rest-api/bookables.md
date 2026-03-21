---
title: Bookables
description: CRUD endpoints for bookable entities (services, rooms, tables, etc.).
---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/bookables` | List all bookable entities |
| POST | `/wpappointments/v1/bookables` | Create a bookable entity |
| GET | `/wpappointments/v1/bookables/{id}` | Get a single bookable entity |
| PUT/PATCH | `/wpappointments/v1/bookables/{id}` | Update a bookable entity |
| DELETE | `/wpappointments/v1/bookables/{id}` | Delete a bookable entity |

All endpoints require the `wpa_manage_bookables` capability.

---

## GET /bookables

List all bookable entities with optional filtering and pagination.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postsPerPage | integer | No | Number of results per page (default: `-1` for all) |
| paged | integer | No | Page number (default: `1`) |
| type | string | No | Filter by bookable type slug (e.g. `service`, `room`) |
| active | boolean | No | Filter by active status |

### Response

```json
{
  "status": "success",
  "message": "Bookables fetched successfully",
  "data": {
    "bookables": [
      {
        "id": 10,
        "name": "Deep Tissue Massage",
        "active": true,
        "description": "60-minute deep tissue session",
        "type": "service",
        "image": "https://example.com/massage.jpg",
        "scheduleId": 3,
        "bufferBefore": 10,
        "bufferAfter": 5,
        "minLeadTime": 3600,
        "maxLeadTime": 2592000,
        "duration": 60,
        "attributes": [
          { "name": "Duration", "values": ["30", "60", "90"] }
        ],
        "meta": { ... }
      }
    ],
    "totalItems": 12,
    "totalPages": 1,
    "postsPerPage": -1,
    "currentPage": 1
  }
}
```

---

## POST /bookables

Create a new bookable entity. Variants are automatically generated from the attribute matrix.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Display name |
| type | string | No | Bookable type slug (e.g. `service`) |
| active | boolean | No | Whether the entity is active (default: `true`) |
| description | string | No | Description text |
| image | string | No | Image URL |
| schedule_id | integer | No | Associated schedule post ID |
| buffer_before | integer | No | Buffer time before appointments in minutes |
| buffer_after | integer | No | Buffer time after appointments in minutes |
| min_lead_time | integer | No | Minimum lead time in seconds |
| max_lead_time | integer | No | Maximum lead time in seconds |
| duration | integer | No | Default duration in minutes |
| attributes | array | No | Attribute definitions, e.g. `[{"name": "Duration", "values": ["30", "60"]}]` |

Type-specific fields defined by the bookable type handler are also accepted and validated.

### Response

```json
{
  "status": "success",
  "message": "Bookable created successfully",
  "data": {
    "bookable": {
      "id": 10,
      "name": "Deep Tissue Massage",
      "active": true,
      "description": "",
      "type": "service",
      "image": "",
      "scheduleId": 0,
      "bufferBefore": 0,
      "bufferAfter": 0,
      "minLeadTime": 0,
      "maxLeadTime": 0,
      "duration": 60,
      "attributes": [],
      "meta": { ... }
    }
  }
}
```

---

## GET /bookables/{id}

Get a single bookable entity by ID.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Bookable entity ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Bookable fetched successfully",
  "data": {
    "bookable": { ... }
  }
}
```

---

## PUT/PATCH /bookables/{id}

Update an existing bookable entity. If `attributes` are changed, variants are regenerated from the new matrix.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Bookable entity ID (URL parameter) |
| name | string | No | Updated display name |
| type | string | No | Updated bookable type slug |
| active | boolean | No | Updated active status |
| description | string | No | Updated description |
| image | string | No | Updated image URL |
| schedule_id | integer | No | Updated schedule ID |
| buffer_before | integer | No | Updated buffer before |
| buffer_after | integer | No | Updated buffer after |
| min_lead_time | integer | No | Updated minimum lead time |
| max_lead_time | integer | No | Updated maximum lead time |
| duration | integer | No | Updated default duration |
| attributes | array | No | Updated attribute definitions (triggers variant regeneration) |

### Response

```json
{
  "status": "success",
  "message": "Bookable updated successfully",
  "data": {
    "bookable": { ... }
  }
}
```

---

## DELETE /bookables/{id}

Delete a bookable entity and all its variants (cascade delete).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Bookable entity ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Bookable deleted successfully",
  "data": {
    "id": 10
  }
}
```
