---
title: Variants
description: CRUD endpoints for bookable variants, nested under their parent entity.
---

Variants are the actual bookable units. Every bookable entity has at least one variant. Variants can override specific fields from their parent entity (duration, schedule, buffers, lead times).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/bookables/{entity_id}/variants` | List all variants for an entity |
| POST | `/wpappointments/v1/bookables/{entity_id}/variants` | Create a variant |
| POST | `/wpappointments/v1/bookables/{entity_id}/variants/generate` | Generate variants from attribute matrix |
| GET | `/wpappointments/v1/bookables/{entity_id}/variants/{variant_id}` | Get a single variant |
| PUT/PATCH | `/wpappointments/v1/bookables/{entity_id}/variants/{variant_id}` | Update a variant |
| DELETE | `/wpappointments/v1/bookables/{entity_id}/variants/{variant_id}` | Delete a variant |

All endpoints require the `wpa_manage_bookables` capability.

---

## GET /bookables/{entity_id}/variants

List all variants belonging to a bookable entity.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Variants fetched successfully",
  "data": {
    "variants": [
      {
        "id": 20,
        "parentId": 10,
        "name": "Deep Tissue Massage — 60, Swedish",
        "active": true,
        "attributeValues": { "Duration": "60", "Type": "Swedish" },
        "overrides": ["duration"],
        "duration": 60,
        "scheduleId": 3,
        "bufferBefore": 10,
        "bufferAfter": 5,
        "minLeadTime": 3600,
        "maxLeadTime": 2592000,
        "meta": { ... }
      }
    ],
    "totalItems": 6,
    "totalPages": 1,
    "postsPerPage": -1,
    "currentPage": 1
  }
}
```

Fields like `duration`, `scheduleId`, `bufferBefore`, `bufferAfter`, `minLeadTime`, and `maxLeadTime` are **effective values** — they reflect the variant's own override or fall back to the parent entity's value.

---

## POST /bookables/{entity_id}/variants

Create a new variant for a bookable entity.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |
| attribute_values | object | No | Attribute key-value pairs, e.g. `{"Duration": "30"}` |
| active | boolean | No | Whether the variant is active (default: `true`) |
| duration | integer | No | Override duration in minutes |
| schedule_id | integer | No | Override schedule ID |
| buffer_before | integer | No | Override buffer before |
| buffer_after | integer | No | Override buffer after |
| min_lead_time | integer | No | Override minimum lead time |
| max_lead_time | integer | No | Override maximum lead time |

### Response

```json
{
  "status": "success",
  "message": "Variant created successfully",
  "data": {
    "variant": {
      "id": 20,
      "parentId": 10,
      "name": "Deep Tissue Massage — 30",
      "active": true,
      "attributeValues": { "Duration": "30" },
      "overrides": [],
      "duration": 60,
      "scheduleId": 0,
      "bufferBefore": 0,
      "bufferAfter": 0,
      "minLeadTime": 0,
      "maxLeadTime": 0,
      "meta": { ... }
    }
  }
}
```

---

## POST /bookables/{entity_id}/variants/generate

Generate all variant combinations from the parent entity's attribute matrix. Existing variants with matching attribute values are preserved. Orphaned variants are deactivated.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Variants generated successfully",
  "data": {
    "variants": [
      {
        "id": 20,
        "parentId": 10,
        "name": "Deep Tissue Massage — 30, Swedish",
        "active": true,
        "attributeValues": { "Duration": "30", "Type": "Swedish" },
        "overrides": [],
        "duration": 60,
        "scheduleId": 0,
        "bufferBefore": 0,
        "bufferAfter": 0,
        "minLeadTime": 0,
        "maxLeadTime": 0,
        "meta": { ... }
      }
    ]
  }
}
```

---

## GET /bookables/{entity_id}/variants/{variant_id}

Get a single variant. Returns a 404 if the variant does not belong to the specified entity.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |
| variant_id | integer | Yes | Variant ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Variant fetched successfully",
  "data": {
    "variant": { ... }
  }
}
```

---

## PUT/PATCH /bookables/{entity_id}/variants/{variant_id}

Update a variant. Returns a 404 if the variant does not belong to the specified entity.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |
| variant_id | integer | Yes | Variant ID (URL parameter) |
| attribute_values | object | No | Updated attribute values |
| active | boolean | No | Updated active status |
| duration | integer | No | Override duration |
| schedule_id | integer | No | Override schedule ID |
| buffer_before | integer | No | Override buffer before |
| buffer_after | integer | No | Override buffer after |
| min_lead_time | integer | No | Override minimum lead time |
| max_lead_time | integer | No | Override maximum lead time |

### Response

```json
{
  "status": "success",
  "message": "Variant updated successfully",
  "data": {
    "variant": { ... }
  }
}
```

---

## DELETE /bookables/{entity_id}/variants/{variant_id}

Delete a variant. Returns a 404 if the variant does not belong to the specified entity.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| entity_id | integer | Yes | Parent bookable entity ID (URL parameter) |
| variant_id | integer | Yes | Variant ID (URL parameter) |

### Response

```json
{
  "status": "success",
  "message": "Variant deleted successfully",
  "data": {
    "id": 20
  }
}
```
