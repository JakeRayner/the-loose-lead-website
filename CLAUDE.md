# Figma Design Implementation Rules

## Core Rule
Never guess, assume, or hallucinate design values. Every colour, spacing, font, size, and layout must come directly from Figma via the MCP server.

## Workflow — always follow this order

1. **Read the Figma file first**
   - Use the Figma MCP to inspect the design before writing any code
   - Extract every relevant node: colours, typography, spacing, border radius, opacity, shadows, layout modes

2. **Map values exactly**
   - Use the exact hex values from Figma (not approximate equivalents)
   - Use the exact pixel/rem values for padding, margin, gap, width, height
   - Use the exact font family, weight, size, line height, and letter spacing
   - Use the exact border radius values
   - Use the exact box shadow values if present

3. **Build the component**
   - Implement using the framework already in this project
   - Match the Figma layout mode (auto layout = flexbox, fixed = explicit dimensions)
   - Match component hierarchy — Figma frames become divs/sections in the same nesting order
   - Match responsive behaviour if Figma uses constraints or variants

4. **Never invent values**
   - If a value is unclear in Figma, ask before guessing
   - Do not substitute brand colours, system fonts, or generic spacing
   - Do not apply your own aesthetic judgement — replicate exactly what is in Figma

## When given a Figma link
- Always call the Figma MCP tool to fetch the file/node before writing code
- If a specific frame or component is linked, inspect that node and its children
- List the extracted values before coding so they can be verified

## Output format
- Produce clean, readable component code
- Use CSS variables or a local constants file if the project already has one
- Add a comment at the top of each file referencing the Figma node name/ID it was built from

---

## Icon Handling Rules

### Icon library location
All project icons live in `/public/icons/`. This is the single source of truth. Never create an icon outside this folder or inline an SVG ad-hoc in a component.

### Step 1 — Scrape icons from Figma before building anything
When reading a Figma design, identify every icon present in the frame. For each icon found:
- Read the full container frame (e.g. a 20x20 frame named "icon/search") — not just the inner vector path
- Note the container size exactly as it appears in Figma (e.g. 16x16, 20x20, 24x24)
- Note the stroke width — icons in this project use a 1px stroke at all sizes. Do not scale the stroke.

### Step 2 — Check the existing icon library first
Before exporting anything, check `/public/icons/` for an existing SVG that matches:
- Same icon name (e.g. `search`, `bag`, `chevron`)
- Same container size (e.g. `search-20.svg`, `search-16.svg`)

**If a matching icon already exists** → use it. Do not re-export, do not create a duplicate, do not implement a custom version.

**If the icon exists but not at the required size** → export a new size-specific SVG from Figma for that icon and add it to the library.

**If the icon has never been seen before** → export it as a new SVG and add it to the library.

### Step 3 — Exporting SVGs correctly
When exporting an icon from Figma:
- Export the **container frame**, not the inner vector. The SVG viewBox must match the container dimensions (e.g. `viewBox="0 0 20 20"` for a 20x20 icon)
- Set `width` and `height` on the SVG element to match the container size
- Preserve the exact vector paths from Figma — do not redraw or approximate
- Use `stroke="currentColor"` and `stroke-width="1"` so the icon inherits colour from CSS and always renders at 1px stroke
- Remove any hardcoded fill or stroke colours from the exported SVG
- Do not add padding, margins, or background to the SVG

### Step 4 — Naming convention
Icons are named: `{icon-name}-{size}.svg`
Examples: `search-16.svg`, `search-20.svg`, `bag-24.svg`, `chevron-16.svg`

If an icon appears at multiple sizes in the design, each size gets its own file. This ensures the 1px stroke weight is always correct at the rendered size rather than being scaled.

### Step 5 — Using icons in components
Always reference icons from the library, never inline SVG paths directly in TSX/JSX.
Use an `<Icon>` component or `<img>` tag pointing to `/icons/{icon-name}-{size}.svg`, whichever pattern is already established in this project.

### Summary of icon rules
| Scenario | Action |
|---|---|
| Icon exists at correct size | Use existing file, no export |
| Icon exists but wrong size | Export new size from Figma, add to library |
| Brand new icon | Export from Figma, add to library |
| Icon seen in design but unclear | Ask before guessing or redrawing |
| Tempted to inline SVG in component | Don't — always use the library |

---

## Touch Target Rules

### Minimum touch area
Every interactive element must have a minimum touch target of 44x44px. This is invisible — no visual change to the design.

### How to implement
Use padding or a pseudo-element to expand the hit area without affecting layout:

```css
/* Preferred — padding approach */
.icon-button {
  padding: 12px;        /* expands a 20x20 icon to 44x44 touch area */
  margin: -12px;        /* cancel out the layout impact */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Alternative — pseudo-element approach */
.icon-button {
  position: relative;
}
.icon-button::before {
  content: '';
  position: absolute;
  inset: -12px;         /* expands touch area in all directions */
}
```

### Elements that always need this treatment
- Chevrons / arrows
- Close buttons (×)
- Icon-only buttons (search, bag, menu, heart, share)
- Checkboxes and radio buttons
- Toggle switches
- Pagination dots
- Social media icons

### Rules
- Never rely on the visual size of an element as its touch target
- Do not add borders, backgrounds, or any visible style to the expanded area
- Use `margin: -Xpx` to cancel layout impact when using padding to expand
- In TSX/JSX wrap small interactive icons in a button element with appropriate padding rather than making the SVG itself clickable
- If an icon is already inside a button or link that is naturally large enough (e.g. a full-width CTA), no additional touch target treatment is needed
- Apply this to every size of icon — a 12x12 icon needs more padding than a 24x24 icon but both must reach 44x44
