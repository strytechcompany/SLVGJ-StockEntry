# Design System Strategy: The Gilded Portfolio

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system rejects the "SaaS-in-a-box" aesthetic in favor of a high-end editorial experience. For a high-end inventory management system, the interface must mirror the value of the assets it tracks. We move away from rigid, boxed grids and toward an expansive, "gallery-style" layout. 

The system utilizes **intentional asymmetry**—offsetting large display typography against precise, data-heavy modules—to create a sense of bespoke craftsmanship. By layering creamy whites with metallic accents and deep charcoal contrast, we evoke the feeling of a physical luxury catalog rather than a utilitarian database.

---

## 2. Colors & Surface Architecture

The palette is anchored in the interplay between light and metal. We use depth and tone, rather than lines, to define the environment.

### Color Roles
*   **Primary (#735C00 / #D4AF37):** Reserved for moments of intent. Use `primary` for high-action states and `primary_container` (#D4AF37) for brand-defining surfaces.
*   **Surface Hierarchy:** We utilize a "White-on-Cream" stacking method.
    *   `surface` (#F9F9F9): The base floor of the application.
    *   `surface_container_lowest` (#FFFFFF): Used for the highest level of "lifted" content, like an active inventory card.
    *   `surface_container` (#EEEEEE): Used for recessed utility areas like sidebars or secondary metadata panels.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid charcoal or grey borders for sectioning. 
*   Boundaries must be defined by shifting from `surface` to `surface_container_low`. 
*   Visual separation is achieved through the **Spacing Scale** (using `6` [2rem] or `8` [2.75rem]) to let the layout breathe.

### The "Glass & Gold" Rule
For floating elements (modals, dropdowns), use **Glassmorphism**. Apply a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 12px. Combine this with a 1px "Ghost Border" using `outline_variant` at 20% opacity to mimic the edge of a polished crystal.

---

## 3. Typography: Editorial Precision

The choice of **Manrope** provides a geometric yet humanist touch that feels modern and authoritative.

*   **Display Scale:** Use `display-lg` (3.5rem) for high-level inventory totals or "hero" metrics. These should be set with a slight letter-spacing reduction (-0.02em) to feel like a premium masthead.
*   **Headline & Title:** `headline-sm` (1.5rem) should be used for section headers. Always pair these with `label-md` uppercase sub-headers in `on_surface_variant` (#4D4635) to create an "archival" look.
*   **Body & Labels:** `body-md` is your workhorse. For data density in inventory tables, use `label-md` for static values and `body-sm` for user-generated descriptions.

---

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Instead of shadows, place a `surface_container_lowest` card atop a `surface_container_low` background. This "paper-on-stone" effect creates a soft, natural lift.
*   **Ambient Shadows:** Where floating action is required (e.g., a "Create Entry" FAB), use a shadow with a 24px blur, 0% spread, and an opacity of 6% using the `on_surface` color. It should feel like an object hovering in a brightly lit room, not a digital effect.
*   **Signature Textures:** Use a subtle linear gradient on primary buttons: `linear-gradient(135deg, #D4AF37 0%, #735C00 100%)`. This mimics the way light hits real gold leaf, adding "soul" to the interactive points.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container` (#D4AF37) with `on_primary` (#FFFFFF) text. Roundedness: `md` (0.375rem).
*   **Secondary:** Ghost style. No background, `outline` border at 30% opacity, and `primary` text.
*   **Tertiary:** Text only, uppercase `label-md`, with a 2px underline in `primary_fixed_dim` appearing only on hover.

### Inventory Cards & Lists
*   **Prohibition:** No divider lines between list items.
*   **Alternative:** Use a background shift. Even-numbered rows use `surface`, odd-numbered rows use `surface_container_low`. 
*   **Card Styling:** Use `surface_container_lowest` with a `sm` (0.125rem) gold border (`outline_variant`) only on the "active" or "selected" state.

### Input Fields
*   **Default State:** A simple bottom-border (2px) using `outline_variant`. The background should be a subtle `surface_container_low`.
*   **Focus State:** The bottom border transforms into the `primary` gold. The label floats upward using `label-sm` in `primary`.

### Specialized Inventory Components
*   **Status Badges:** Use high-chroma `on_primary_container` text on a `surface_bright` background. Avoid "Stoplight" colors (Red/Green) where possible; instead, use tonal shifts of the gold/charcoal palette to indicate urgency.
*   **The "Luxe" Progress Bar:** A thin (2px) track in `outline_variant` with a `primary` gold fill that features a soft outer glow.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical white space. If a table is on the left, let the right side of the screen breathe with a large display metric or a minimal "Curated" image of the asset.
*   **Do** use `on_surface_variant` for metadata. It provides enough contrast for accessibility while maintaining the "gold and cream" softness.
*   **Do** prioritize the **Spacing Scale** `4` (1.4rem) for internal card padding to ensure a premium feel.

### Don't
*   **Don't** use pure black (#000000). Always use `on_background` (#1A1C1C) for text to keep the interface feeling warm.
*   **Don't** use standard `lg` (0.5rem) or `xl` (0.75rem) corner radii for main containers. Stick to `sm` or `none` for a sharper, more "precise" and architectural look.
*   **Don't** use heavy "card shadows" on every element. If everything floats, nothing is important. Rely on tonal shifts first.