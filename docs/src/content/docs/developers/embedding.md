---
title: Embedding the Booking Flow
description: How to embed the WP Appointments booking flow using the Gutenberg block, shortcode, widget, or PHP template tag.
---

WP Appointments provides four ways to embed the booking flow on your site. Choose the method that fits your setup.

## Gutenberg Block

The **Booking Flow** block is available in the block editor under the **WP Appointments** category. It supports these settings in the block inspector:

| Setting | Options | Default |
|---------|---------|---------|
| Flow type | One Step, Multi Step | One Step |
| Alignment | Left, Center, Right | Left |
| Width | Narrow, Full | Narrow |
| Trim unavailable | On/Off | On |
| Slots as buttons | On/Off | Off |

## Shortcode

Use the `[wpappointments]` shortcode in the classic editor, page builders, or anywhere shortcodes are supported.

```text
[wpappointments]
[wpappointments flow_type="MultiStep" alignment="Center" width="Full"]
[wpappointments trim_unavailable="0" slots_as_buttons="1"]
```

### Shortcode Attributes

| Attribute | Values | Default |
|-----------|--------|---------|
| `flow_type` | `OneStep`, `MultiStep` | `OneStep` |
| `alignment` | `Left`, `Center`, `Right` | `Left` |
| `width` | `Narrow`, `Full` | `Narrow` |
| `trim_unavailable` | `1`, `0` | `1` |
| `slots_as_buttons` | `1`, `0` | `0` |

## Widget

The **WP Appointments Booking Flow** widget is available in **Appearance → Widgets** for classic themes. It provides a settings form with the same options as the Gutenberg block.

## PHP Template Tag

For theme developers who need to render the booking flow directly in PHP templates:

```php
<?php wpappointments_render_booking_flow(); ?>
```

With custom attributes:

```php
<?php
wpappointments_render_booking_flow( array(
    'flowType'        => 'MultiStep',
    'alignment'       => 'Center',
    'width'           => 'Full',
    'trimUnavailable' => true,
    'slotsAsButtons'  => false,
) );
?>
```

:::note
The template tag uses **camelCase** attribute keys (matching the JS/block API), while the shortcode uses **snake_case**.
:::

## Filters

- **`wpappointments_booking_flow_attributes`** — Modify attributes before rendering. Applied by the Gutenberg block, shortcode, and template tag.
- **`wpappointments_booking_flow_output`** — Modify the final HTML output. Applied by the Gutenberg block only (not the shortcode or template tag).
