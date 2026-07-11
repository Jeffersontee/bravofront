---
name: dashboard-layout
description: Layout systems and menus for dashboards in the frontend.
---
# Dashboard Layout & View Mode Patterns

This skill covers the layout organization, split pane setup, side menus, and responsiveness of the dashboard interface, as well as e-commerce view mode selections.

## 🎛️ E-commerce View Modes (List vs Grid)

To offer premium browsing experiences in the establishment menu:

1. **View Mode Segment Selector:**
   * Place a compact `<ion-segment>` selector allowing the user to toggle between `'list'` and `'grid'` mode.
   * Place it aligned to filter controls (e.g., to the right of "VEG ONLY") to optimize spacing.

2. **Grid View Layout:**
   * Render cards side-by-side using CSS Grid layout with `grid-template-columns: repeat(2, 1fr)`.
   * Configure `object-fit: contain` on thumbnails in grid view cards to prevent product cropping.

## 🏷️ Category Chips Scroller (Horizontal Navigation)

* Render horizontally scrollable categories chips list utilizing custom container `categories-grid__scroll`.
* Enable active class styling conditionally using signals (e.g. `[class.category-chip--active]="selectedCategory() === cat._id"`).
* Hide the horizontal scrollbar with CSS rules (`display: none` for Webkit scrollbars) for a clean visual.
