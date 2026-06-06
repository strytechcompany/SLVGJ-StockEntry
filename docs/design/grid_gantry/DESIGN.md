# Design System Strategy: The Precision Architect

## 1. Overview & Creative North Star
In the world of inventory management, data is often treated as a burden to be managed. This design system reframes data as a premium asset. Our Creative North Star is **"The Digital Curator."** 

We are moving away from the cluttered, "industrial" look of legacy ERP systems and toward a high-end, editorial experience. The system breaks the "standard dashboard" mold by utilizing intentional white space, extreme typographic contrast, and a "layered paper" philosophy. By eschewing traditional borders in favor of tonal shifts and soft elevations, we create a UI that feels architectural, authoritative, and breathable.

## 2. Color & Tonal Depth
Our palette is rooted in a deep, commanding navy (`primary: #041632`) set against an expansive, high-clarity canvas (`surface: #f8f9fa`). 

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. This design system prohibits them. Boundaries must be defined through background color shifts. For example, a sidebar using `surface_container_low` should sit flush against a `surface` main content area. The transition of color *is* the boundary.

### Surface Hierarchy & Nesting
Think of the interface as stacked sheets of premium cardstock.
*   **Base Layer:** `surface` (#f8f9fa) – The desk on which everything sits.
*   **Section Layer:** `surface_container_low` (#f3f4f5) – Defines large functional regions.
*   **Object Layer:** `surface_container_lowest` (#ffffff) – Used for individual data cards to provide a "pop" of crispness against the slightly darker background.

### The "Glass & Gradient" Rule
To prevent the navy from feeling "heavy," primary actions should utilize a subtle linear gradient from `primary` (#041632) to `primary_container` (#1b2b48). For overlays and floating panels, apply a **Glassmorphism** effect: use a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 12px. This ensures the inventory data beneath is felt, even when obscured.

## 3. Typography: The Editorial Edge
We pair the geometric authority of **Manrope** for headers with the high-utility legibility of **Inter** for data.

*   **Display & Headlines (Manrope):** Use `display-lg` and `headline-md` for high-level stock overviews. The wide tracking and bold weights convey a sense of "The Architect" in control.
*   **Titles & Body (Inter):** Inventory values (SKUs, Quantities) should use `title-sm` with a **Medium (500) or Semi-Bold (600)** weight to distinguish them from labels.
*   **Labels (Inter):** Use `label-md` in `on_surface_variant` (#44474d). This creates a clear hierarchy: the label recedes, and the data (the value) advances.

## 4. Elevation & Depth
We achieve hierarchy through **Tonal Layering** rather than structural scaffolding.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a natural, soft lift that is easier on the eyes than high-contrast shadows.
*   **Ambient Shadows:** For Floating Action Buttons (FAB) or Modals, use an extra-diffused shadow. 
    *   *Spec:* `0px 12px 32px rgba(4, 22, 50, 0.08)`. Note the tint: we use a fraction of our `primary` navy color instead of pure black to keep the shadow "airy."
*   **The Ghost Border:** If a separator is required for extreme density, use `outline_variant` (#c5c6ce) at **15% opacity**. It should be felt more than seen.

## 5. Signature Components

### Data Tables (The Ledger)
*   **Layout:** Eliminate vertical and horizontal lines.
*   **State:** On hover, change the row background to `surface_container_high` (#e7e8e9) and apply a `DEFAULT` (0.25rem) corner radius to the row. This makes the row feel like a selectable "object" rather than just a line of text.
*   **Data Points:** Use `tertiary` (#211500) for "Low Stock" warnings—it provides a sophisticated gold/brown warning that is less "alarming" but more "premium" than standard orange.

### Buttons & FABs
*   **Primary:** A gradient-filled container using `primary` to `primary_container`. 
*   **FAB:** Utilize the `xl` (0.75rem) roundedness scale. It should sit in the bottom right, using the "Ambient Shadow" spec to appear as if it is floating 16px above the content.
*   **Tertiary:** Use `on_primary_fixed_variant` (#374765) for ghost buttons to maintain high-end brand alignment without the weight of a fill.

### Structured Forms
*   **Inputs:** Use `surface_container_highest` (#e1e3e4) as the input background with a bottom-only "Ghost Border." When focused, transition the background to `surface_container_lowest` (#ffffff) and the border to `primary`.
*   **Validation:** Use `error` (#ba1a1a) text for messages, but tint the input background with `error_container` (#ffdad6) at 20% opacity for a sophisticated "blush" effect.

### Inventory Chips
*   **Status:** Instead of solid colored pills, use a `surface_variant` (#e1e3e4) background with a 4px circular "dot" of the status color (e.g., `primary` for "In Transit", `error` for "Out of Stock").

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Balance a large `display-md` header on the left with a "floating" `surface_container_lowest` stats card on the right to break the grid.
*   **Embrace Space:** Use the `16` (3.5rem) spacing token between major functional blocks. Inventory management is stressful; the UI should be calm.
*   **Contextual Elevation:** Only elevate elements that are "actionable" (Buttons, Cards). Static content should remain flat and tonal.

### Don’t:
*   **Don't use 100% Black:** Never use `#000000`. Use `on_surface` (#191c1d) for text to maintain a soft, high-end ink feel.
*   **Don't use Dividers:** If you feel the need to add a line, try adding `8` (1.75rem) of white space instead. 
*   **Don't Over-Round:** Keep corner radius to `md` (0.375rem) for most cards. Only use `full` for tags or FABs. This maintains a professional, "architectural" edge.