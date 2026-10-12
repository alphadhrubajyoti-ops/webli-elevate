# Sales page and admin controls

## Build
- Add a public `sales` table for sale title, description, image, optional destination link, visibility, and display order, with public reads limited to live sales and admin-only management.
- Add an Admin → Sales page to create, edit, publish/hide, and delete sales. Support an image URL or a compressed image selected from the device.
- Add `/sales` with a clear no-live-sale state and a live-sale view showing the title, large image, description, and optional link. Add Sales to public navigation and footer.

## Verify
- Confirm the page says “No sale is currently live.” with no active sale, and that an admin-created live sale appears with its image and link.
- Check the route and admin page load and review the latest build/browser errors. Keep the rest of the website unchanged.

## Technical details
- Use a Lovable Cloud migration with explicit grants and row-level policies; expose only live sales publicly.
- Store uploaded images as optimized WebP data URLs in the sales image field, avoiding dependence on public storage buckets.
