# Package discount pricing

## Build
- Add original numeric price and discount percentage to existing packages while retaining the current price label for compatibility; populate the new price from existing numeric labels where possible.
- Add admin inputs for original price and discount percentage with a live calculated-price preview and validation for nonnegative prices and discounts from 0–100%.
- Move price display to the bottom of each public package card; show original price crossed out, discount, and calculated final price only when a discount is active.

## Verify
- Test price calculation and boundary validation, run the project’s build checks, and inspect the public package cards and admin form.

## Technical details
- Use an additive Lovable Cloud migration with grants and existing package RLS; no new package or unrelated page changes.
- Format amounts consistently with the site’s existing Indian-rupee prices and round final prices to the nearest rupee.
