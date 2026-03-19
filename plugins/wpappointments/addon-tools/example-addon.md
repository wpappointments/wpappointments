# Building a WP Appointments Addon Plugin

## Quick Start

### 1. Plugin PHP scaffold

```php
<?php
/**
 * Plugin Name: WPA Court Booking
 * Description: Tennis court booking for WP Appointments
 * Requires Plugins: wpappointments
 */

use WPAppointments\Admin\BookableTypeAdminPage;
use WPAppointments\Bookable\AbstractBookableTypeHandler;
use function WPAppointments\Bookable\register_bookable_type;

// Register the bookable type
add_action('wpappointments_register_bookable_types', function() {
    register_bookable_type('court', CourtHandler::class);
});

// Register admin page
add_action('wpappointments_register_admin_pages', function() {
    BookableTypeAdminPage::register([
        'type'       => 'court',
        'page_title' => __('Courts', 'wpa-court-booking'),
        'menu_title' => __('Courts', 'wpa-court-booking'),
    ]);
});

// Enqueue admin scripts on court pages
add_action('wpappointments_enqueue_court_scripts', function() {
    $asset = require plugin_dir_path(__FILE__) . 'build/admin.asset.php';
    wp_enqueue_script(
        'wpa-court-booking-admin',
        plugin_dir_url(__FILE__) . 'build/admin.js',
        array_merge($asset['dependencies'], ['wpappointments-shared-js']),
        $asset['version'],
        true
    );
});

// Type handler
class CourtHandler extends AbstractBookableTypeHandler {
    public function get_slug(): string { return 'court'; }
    public function get_label(): string { return __('Court', 'wpa-court-booking'); }

    public function get_fields(): array {
        return [
            'surface'     => '',      // clay, hard, grass
            'indoor'      => false,
            'lighting'    => false,
            'max_players' => 4,
        ];
    }

    public function get_variant_overridable_fields(): array {
        return ['max_players'];
    }
}
```

### 2. Webpack config

```js
// webpack.config.js
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const wpaPreset = require('wpappointments/addon-tools/webpack-preset');

module.exports = wpaPreset(defaultConfig);
```

### 3. Admin page component

```tsx
// src/admin.tsx
const {
    DataViews, SlideOut, LayoutDefault, mountAddonPage,
    StateContextProvider, useSlideout, HtmlForm, withForm,
    Input, Toggle, FormFieldSet,
} = window.wpappointments.components;

function CourtListPage() {
    return (
        <StateContextProvider>
            <LayoutDefault title="Courts">
                {/* Your court list UI using DataViews, SlideOut, etc. */}
            </LayoutDefault>
        </StateContextProvider>
    );
}

mountAddonPage('wpappointments-court', CourtListPage);
```

### 4. Package.json

```json
{
    "scripts": {
        "build": "wp-scripts build src/admin.tsx",
        "start": "wp-scripts start src/admin.tsx"
    },
    "devDependencies": {
        "@wordpress/scripts": "^27.0.0"
    }
}
```

## How It Works

1. **PHP side**: `register_bookable_type()` tells core about your type. `BookableTypeAdminPage::register()` adds a menu item.

2. **Build**: `@wordpress/scripts` externalizes React and `@wordpress/*`. The WPA preset additionally externalizes `@wpappointments/components` → `window.wpappointments.components`.

3. **Runtime**: Your script declares `wpappointments-shared-js` as a dependency. WordPress loads core's shared components first, then your addon.

4. **React sharing**: Both core and addon use the same React from `window.React` (via wp-scripts externalization). All hooks, context, and state work across bundles.

## Available from `window.wpappointments.components`

| Export | Type | Description |
|--------|------|-------------|
| `DataViews` | Component | Data table with sorting, filtering, pagination |
| `SlideOut` | Component | Slide-out panel (dialog with close button) |
| `LayoutDefault` | Component | Admin page layout wrapper |
| `CardBody` | Component | Card body wrapper |
| `DeleteModal` | Component | Confirmation dialog for destructive actions |
| `TableFullEmpty` | Component | Empty state for tables |
| `HtmlForm` | Component | Form wrapper with React Hook Form |
| `withForm` | HOC | Wraps component with form context |
| `Input` | Component | Text/number input field |
| `Toggle` | Component | Boolean toggle switch |
| `FormFieldSet` | Component | Group of form fields |
| `useSlideout` | Hook | Open/close slide-out panels |
| `useFillFormValues` | Hook | Pre-fill form with existing data |
| `store` | Store | @wordpress/data store instance |
| `applyFilters` | Function | Apply WordPress JS filters |
| `doAction` | Function | Trigger WordPress JS actions |
| `StateContextProvider` | Context | Cache invalidation provider |
| `useStateContext` | Hook | Access state context |
| `mountAddonPage` | Function | Mount React app into addon admin page |
| `createRoot` | Function | React createRoot for advanced mounting |
