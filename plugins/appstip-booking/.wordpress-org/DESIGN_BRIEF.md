# Appstip Booking — wp.org listing assets brief

These assets are uploaded to the wp.org SVN `assets/` directory after plugin
approval. They are **not** bundled in the submission ZIP. Drop the final files
into `.wordpress-org/` next to this brief — the deploy action (or manual SVN
copy) picks them up from there.

## Files required

| File | Dimensions | Purpose |
|---|---|---|
| `banner-772x250.png` | 772 × 250 | Listing page header (standard density) |
| `banner-1544x500.png` | 1544 × 500 | Listing page header (high-DPI / retina) |
| `icon-128x128.png` | 128 × 128 | Plugin directory tile + dashboard search |
| `icon-256x256.png` | 256 × 256 | Same, retina |
| `icon.svg` *(optional)* | vector | Preferred over rasters when both exist |

## Brand direction

**Identity:** Appstip is a fresh, distinct brand for the wp.org-facing free
plugin. It is not a sub-brand of wppoland — keep wppoland marks, colors, and
imagery off these assets.

**Personality:** clean, calm, neutral. The plugin manages appointments — it
is a working tool, not an aspirational lifestyle product.

**What the assets must avoid:**
- WordPress logo / "WP" wordmarks (trademark sensitivity — the slug already
  drops "WP" intentionally).
- Stock calendars / clocks copied from icon kits (looks generic).
- Photographs of people in service settings (wp.org reviewers flag stock
  photos as visual noise).
- Drop shadows behind glyphs (rejected aesthetic on the directory).

## Banner

Single-color or two-tone background, plugin name in clean sans-serif, small
secondary line for tagline. The 1544×500 should be the same composition,
not a different layout — readers shouldn't see two unrelated banners.

**Tagline candidate (subject to copy review):**
> Appointments, the WordPress way.

Keep it under ~6 words. Avoid superlatives ("the best", "powerful", "ultimate").

## Icon

A geometric mark, not a literal calendar. Suggested directions:
1. Stylized "a" letterform with a small dot (the "tip" pun on the brand).
2. Two stacked horizontal bars suggesting time slots.
3. A circle with a tick mark cut into it (booking confirmed).

Keep contrast strong at 128×128 — that's the size most users actually see.

## Color suggestion (open to change)

- Primary: deep teal or slate (`#1F2A37`-ish), readable on light themes.
- Accent: warm amber for highlights, used sparingly.
- Avoid pure black (looks heavy in the directory grid).

## Notes for designer

- Export PNGs as 8-bit, no alpha for banners (wp.org compresses heavily).
- Icon SVG should keep all paths flattened, no embedded fonts.
- Test the icon at 64×64 and 32×32 — if it falls apart, simplify.
