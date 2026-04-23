---
title: Settings
description: Endpoints for reading and updating plugin settings by category.
---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/settings` | Get all settings |
| GET | `/wpappointments/v1/settings/{category}` | Get settings for a category |
| PUT/PATCH | `/wpappointments/v1/settings/{category}` | Update settings for a category |

All endpoints require the `wpa_manage_settings` capability.

---

## GET /settings

Get all plugin settings across every category.

### Parameters

None.

### Response

```json
{
  "status": "success",
  "message": "Settings fetched successfully",
  "data": {
    "settings": {
      "general": { ... },
      "appointments": {
        "defaultLength": 60,
        "defaultStatus": "confirmed"
      },
      "notifications": { ... }
    }
  }
}
```

The settings object is keyed by category, with each category containing its own key-value pairs.

---

## GET /settings/{category}

Get settings for a specific category.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Settings category slug (URL parameter), e.g. `general`, `appointments`, `notifications` |

### Response

```json
{
  "status": "success",
  "message": "Settings in category fetched successfully",
  "data": {
    "settings": {
      "defaultLength": 60,
      "defaultStatus": "confirmed"
    }
  }
}
```

---

## PUT/PATCH /settings/{category}

Update settings for a specific category. Send only the keys you want to change.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Settings category slug (URL parameter) |
| *(body)* | object | Yes | JSON object with setting key-value pairs to update |

### Request Body Example

```json
{
  "defaultLength": 45,
  "defaultStatus": "pending"
}
```

### Response

```json
{
  "status": "success",
  "message": "Settings updated successfully",
  "data": {
    "settings": {
      "defaultLength": 45,
      "defaultStatus": "pending"
    }
  }
}
```
