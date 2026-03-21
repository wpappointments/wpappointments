---
title: Bookable Types
description: Endpoint for listing registered bookable types and their field schemas.
---

Bookable types are registered by plugins via the `BookableTypeRegistry`. Each type defines its own fields, validation rules, and which fields variants can override.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/wpappointments/v1/bookable-types` | List all registered bookable types |

Requires the `wpa_manage_bookables` capability.

---

## GET /bookable-types

List all registered bookable types with their field schemas.

### Parameters

None.

### Response

```json
{
  "status": "success",
  "message": "Bookable types fetched successfully",
  "data": {
    "types": [
      {
        "slug": "service",
        "label": "Service",
        "fields": [
          {
            "name": "price",
            "type": "number",
            "label": "Price",
            "default": 0,
            "required": true,
            "placeholder": "0.00",
            "help": "Price in the store's base currency",
            "validation": { "min": 0 }
          },
          {
            "name": "category",
            "type": "select",
            "label": "Category",
            "default": null,
            "required": false,
            "options": [
              { "value": "haircut", "label": "Haircut" },
              { "value": "massage", "label": "Massage" }
            ]
          }
        ],
        "variantOverridable": ["price"]
      }
    ]
  }
}
```

### Field Schema

Each field in the `fields` array has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| name | string | Field identifier (used as meta key) |
| type | string | Field type (e.g. `text`, `number`, `select`, `textarea`) |
| label | string | Human-readable label |
| default | mixed | Default value |
| required | boolean | Whether the field is required |
| placeholder | string | Placeholder text (only present when set) |
| help | string | Help text (only present when set) |
| options | array | Select/radio options (only present for choice fields) |
| validation | object | Validation rules (only present when defined) |

### variantOverridable

The `variantOverridable` array lists field names from this type that variants are allowed to override. Core overridable fields (`duration`, `schedule_id`, `buffer_before`, `buffer_after`, `min_lead_time`, `max_lead_time`) are always available in addition to type-specific ones.
