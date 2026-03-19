#!/usr/bin/env bash
#
# Verify REST API integration for Demo Court Booking plugin.
#
# Exercises all core REST endpoints with court-type data to confirm
# type-aware delegation, validation, normalization, and availability
# layer composition work correctly.
#
# Usage: bash tools/testing/demo-court-booking/verify-rest-api.sh
#
# Prerequisites:
#   - wp-env running (pnpm run start:wp)
#   - WP Appointments plugin active
#   - Demo Court Booking plugin active (seeds sample data on activation)

set -euo pipefail

BASE="http://localhost:8888/wp-json/wpappointments/v1"
AUTH="admin:password"
PASS=0
FAIL=0

check() {
    local desc="$1"
    local result="$2"
    local expected="$3"

    if echo "$result" | grep -q "$expected"; then
        echo "  ✓ $desc"
        ((PASS++))
    else
        echo "  ✗ $desc"
        echo "    Expected to find: $expected"
        echo "    Got: $(echo "$result" | head -5)"
        ((FAIL++))
    fi
}

echo "=== Bookable Types ==="

TYPES=$(curl -s -u "$AUTH" "$BASE/bookable-types")
check "Court type is registered" "$TYPES" '"slug":"court"'
check "Court label is correct" "$TYPES" '"label":"Court"'
check "Surface type field exists" "$TYPES" '"surface_type"'
check "Max players field exists" "$TYPES" '"max_players"'

echo ""
echo "=== Bookable Entity CRUD ==="

# List courts
LIST=$(curl -s -u "$AUTH" "$BASE/bookables?type=court")
check "Can list court entities" "$LIST" '"success"'
check "Center Court exists" "$LIST" '"Center Court"'
check "Clay Court A exists" "$LIST" '"Clay Court A"'
check "Indoor Court 1 exists" "$LIST" '"Indoor Court 1"'

# Extract Center Court ID
CENTER_ID=$(echo "$LIST" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for b in data.get('data', {}).get('bookables', []):
    if b.get('name') == 'Center Court':
        print(b['id'])
        break
" 2>/dev/null || echo "")

if [ -z "$CENTER_ID" ]; then
    echo "  ✗ Could not extract Center Court ID — skipping single entity tests"
    ((FAIL++))
else
    # Read single entity
    SINGLE=$(curl -s -u "$AUTH" "$BASE/bookables/$CENTER_ID")
    check "Can read single court entity" "$SINGLE" '"Center Court"'
    check "Type field is court" "$SINGLE" '"type":"court"'

    # Create a new court
    NEW=$(curl -s -u "$AUTH" -X POST "$BASE/bookables" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Court","type":"court","surface_type":"grass","indoor":false,"lighting":false,"max_players":2,"duration":3600,"active":true}')
    check "Can create court entity" "$NEW" '"success"'

    NEW_ID=$(echo "$NEW" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('data', {}).get('bookable', {}).get('id', data.get('data', {}).get('id', '')))
" 2>/dev/null || echo "")

    if [ -n "$NEW_ID" ] && [ "$NEW_ID" != "" ]; then
        # Update court
        UPDATED=$(curl -s -u "$AUTH" -X PUT "$BASE/bookables/$NEW_ID" \
            -H "Content-Type: application/json" \
            -d '{"name":"Test Court Updated","surface_type":"clay"}')
        check "Can update court entity" "$UPDATED" '"success"'

        # Validation: invalid surface type
        INVALID=$(curl -s -u "$AUTH" -X PUT "$BASE/bookables/$NEW_ID" \
            -H "Content-Type: application/json" \
            -d '{"surface_type":"concrete"}')
        check "Rejects invalid surface type" "$INVALID" 'invalid_surface_type'

        # Delete court
        DELETED=$(curl -s -u "$AUTH" -X DELETE "$BASE/bookables/$NEW_ID")
        check "Can delete court entity" "$DELETED" '"success"'
    else
        echo "  ✗ Could not extract new court ID — skipping update/delete tests"
        ((FAIL++))
    fi
fi

echo ""
echo "=== Variant CRUD ==="

if [ -n "$CENTER_ID" ]; then
    # List variants for Center Court
    VARIANTS=$(curl -s -u "$AUTH" "$BASE/bookables/$CENTER_ID/variants")
    check "Can list variants" "$VARIANTS" '"success"'
    check "Has With Lights variant" "$VARIANTS" '"With Lights"'
    check "Has No Lights variant" "$VARIANTS" '"No Lights"'

    # Extract a variant ID
    VARIANT_ID=$(echo "$VARIANTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
variants = data.get('data', {}).get('variants', [])
if variants:
    print(variants[0].get('id', ''))
" 2>/dev/null || echo "")

    if [ -n "$VARIANT_ID" ] && [ "$VARIANT_ID" != "" ]; then
        # Read single variant
        SINGLE_V=$(curl -s -u "$AUTH" "$BASE/bookables/$CENTER_ID/variants/$VARIANT_ID")
        check "Can read single variant" "$SINGLE_V" '"success"'
    fi

    # Generate variants from matrix
    GENERATED=$(curl -s -u "$AUTH" -X POST "$BASE/bookables/$CENTER_ID/variants/generate")
    check "Can generate variants from matrix" "$GENERATED" '"success"'
else
    echo "  ✗ No Center Court ID — skipping variant tests"
    ((FAIL++))
fi

echo ""
echo "=== Availability ==="

if [ -n "$VARIANT_ID" ] && [ "$VARIANT_ID" != "" ]; then
    AVAIL=$(curl -s -u "$AUTH" "$BASE/bookable-availability/$VARIANT_ID")
    check "Can query variant availability" "$AVAIL" '"success"'
    check "Has weekly availability" "$AVAIL" '"weekly"'
    check "Monday has facility hours" "$AVAIL" '"monday"'
fi

if [ -n "$CENTER_ID" ]; then
    ENTITY_AVAIL=$(curl -s -u "$AUTH" "$BASE/bookables/$CENTER_ID/availability")
    check "Can query entity-level availability" "$ENTITY_AVAIL" '"success"'
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "Some checks failed. Review output above."
    exit 1
else
    echo "All checks passed!"
    exit 0
fi
