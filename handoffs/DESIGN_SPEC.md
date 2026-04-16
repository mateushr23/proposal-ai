# ProposalAI -- Design Specification

## Design Direction

**Style:** SOFT -- warm, approachable, glass-forward, spring-animated
**Atmosphere:** Professional trust meets modern warmth. The tool should feel like a premium consultancy's internal system -- polished, confident, never toy-like. Think Linear meets Notion with warmer tones.
**Design Dials:** VARIANCE 8 (asymmetric layouts) / MOTION 6 (fluid CSS + spring physics) / DENSITY 4 (airy, generous whitespace)

---

## 1. Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#F8F6F3` | Warm linen base. Subtle warmth avoids sterile white. |
| Foreground | `#1C1917` | Primary text. Warm off-black (never #000). |
| Accent | `#2563EB` | Primary interactive color. Buttons, links, focus rings. Single accent across entire app. |
| Accent Light | `#DBEAFE` | Accent tint for badges, active nav items, soft highlights. |
| Surface | `rgba(255, 255, 255, 0.72)` | Glass card backgrounds. Semi-transparent for blur-through. |
| Surface Hover | `rgba(255, 255, 255, 0.88)` | Hovered glass surfaces. Slightly more opaque. |
| Border | `rgba(28, 25, 23, 0.08)` | Ultra-subtle warm border. Never harsh gray lines. |
| Success | `#059669` | Accepted proposals, successful operations. |
| Warning | `#D97706` | Follow-up pending indicators, confirmation states. |
| Error | `#DC2626` | Form errors, failed routines, rejected proposals. |
| Muted | `#78716C` | Secondary text, helper text, timestamps, subtle labels. |

**Rules:**
- Single accent color throughout. No secondary accent.
- Saturation kept under 80% on all colors.
- No purple, no neon, no gradient text.
- Warm gray family (stone/warm) throughout -- never mix with cool zinc/slate.

---

## 2. Typography

| Level | Font | Weight | Size | Tracking | Leading |
|-------|------|--------|------|----------|---------|
| Display | Outfit | 700 | 36px / 2.25rem | -0.025em | 1.1 |
| H1 | Outfit | 600 | 30px / 1.875rem | -0.02em | 1.2 |
| H2 | Outfit | 600 | 24px / 1.5rem | -0.015em | 1.3 |
| H3 | Outfit | 600 | 20px / 1.25rem | -0.01em | 1.4 |
| Body | Outfit | 400 | 16px / 1rem | normal | 1.65 |
| Small | Outfit | 400 | 14px / 0.875rem | normal | 1.5 |
| Caption | Outfit | 500 | 12px / 0.75rem | 0.02em | 1.4 |
| Mono | JetBrains Mono | 400 | 14px / 0.875rem | normal | 1.5 |

**Font sources:** Outfit is available via `next/font/google`. JetBrains Mono is available via `next/font/google`.

**Rules:**
- No Inter, no Roboto, no Arial.
- No serif fonts anywhere (this is a dashboard/tool, not editorial).
- Outfit provides both headline presence (tracking-tight at heavier weights) and body readability in one family.
- All currency values and numeric data use JetBrains Mono for tabular alignment.

---

## 3. Spacing Scale

| Token | px | rem |
|-------|----|----|
| 1 | 4px | 0.25rem |
| 2 | 8px | 0.5rem |
| 3 | 12px | 0.75rem |
| 4 | 16px | 1rem |
| 5 | 20px | 1.25rem |
| 6 | 24px | 1.5rem |
| 8 | 32px | 2rem |
| 10 | 40px | 2.5rem |
| 12 | 48px | 3rem |
| 16 | 64px | 4rem |

**Application:**
- Section gaps: 64px (token 16)
- Card padding: 24px (token 6)
- Component gaps (between cards in a grid): 16px (token 4)
- Element gaps (label to input, items in a stack): 8px (token 2)
- Inner element gaps (icon to text): 8px (token 2)

---

## 4. Radii

| Element | Radius |
|---------|--------|
| Card / Modal | 20px |
| Button | 12px |
| Input | 12px |
| Badge / Pill | 8px |
| Avatar | 50% (circle) |

---

## 5. Shadows

| Level | Value | Usage |
|-------|-------|-------|
| Card | `0 1px 3px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.06)` | Default card elevation |
| Elevated | `0 4px 12px rgba(28,25,23,0.08), 0 20px 48px rgba(28,25,23,0.10)` | Hovered cards, modals |
| Glass | `inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(28,25,23,0.06)` | Glass panels with inner refraction |

**Rules:**
- All shadows use warm tint (based on foreground `#1C1917`), never pure black.
- No outer glow effects.

---

## 6. Glass Morphism Spec

All surfaces labeled "glass" use:
- `backdrop-filter: blur(20px)` (backdrop-blur-xl)
- Background: `rgba(255, 255, 255, 0.72)`
- Border: `1px solid rgba(28, 25, 23, 0.08)`
- Inner highlight: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12)` (simulates edge refraction)
- Card shadow underneath for depth

**Performance constraint:** `backdrop-blur` only on elements that do not scroll with content. Sidebar (fixed), TopBar (sticky), and card surfaces (contained) are acceptable. Never apply blur to the main scrolling container.

---

## 7. Layout Structure

### Desktop (>=1024px)
- Fixed sidebar 240px on the left
- Main content area: `max-w-[1120px]`, `mx-auto`, `px-6`
- Content grids: 2-column for card lists (`grid-cols-2 gap-4`), single column for forms and detail views

### Tablet (768px-1024px)
- Sidebar collapses to icon-only (64px) or hidden with hamburger
- Content area expands to fill, `px-5`
- Card grids remain 2-column

### Mobile (<768px)
- No sidebar. Sticky TopBar with hamburger.
- Content: `px-4`, full-width single column
- All asymmetric layouts collapse to single column
- Cards stack vertically with 12px gap

**Container:** `max-w-[1120px] mx-auto` -- not edge-to-edge.
**Full height:** `min-h-[100dvh]` -- never `h-screen`.
**Grid over flex-math:** All multi-column layouts use CSS Grid, not calc-based flexbox.

---

## 8. Page Layouts

### /login and /register
Two-column split: left 55% brand panel, right 45% auth form. Brand panel has accent gradient background (135deg, #2563EB to #1D4ED8) with a subtle geometric grid pattern (thin white/10 lines). Auth form is a GlassCard centered vertically, max-w-[400px]. Mobile: brand panel hidden, form full-width with warm background.

### /proposals (list)
PageHeader with title left-aligned, "New Proposal" button right. Below: FilterBar with status pills. Below: 2-column grid of ProposalCards. Empty state centered when no proposals exist. Skeleton loaders match card dimensions during fetch.

### /proposals/new
PageHeader with title + subtitle. Below: single centered GlassCard (max-w-[640px]) containing the ProposalForm. Two-column grid for short fields (client_name + segment, estimated_value + deadline). Service textarea spans full width.

### /proposals/:id
PageHeader with client_name as title, segment + service as subtitle. Right side: ExportPDFButton + StatusBadge. Below: if no generated content, centered EmptyState with GenerateButton. If content exists, vertical stack of 4 SectionEditor cards (introduction, scope, investment, next_steps) with 16px gap. Each section has a 3px left accent border in read mode. GenerateButton repositions to top actions when content exists.

### /routines
PageHeader with title, subtitle explaining the cron schedule, TriggerButton as action. Below: GlassCard wrapping a list of RoutineLogRow entries separated by divide-y borders (not individual cards). Mobile: rows become stacked mini-cards with label-value pairs.

---

## 9. Interaction & Animation Specs

| Interaction | Spec |
|-------------|------|
| Page transition | Fade-in + translateY(-8px to 0), 400ms, cubic-bezier(0.32, 0.72, 0, 1). Stagger page sections by 80ms. |
| Card hover | scale(1.01) + translateY(-2px) + elevated shadow. Spring: stiffness 300, damping 25. |
| Button press | scale(0.98) + translateY(1px) on :active. Spring: stiffness 400, damping 30. |
| Section expand | Height interpolation via layout animation. Spring: stiffness 200, damping 25. Content fades 200ms after. |
| List stagger | translateY(12px) + opacity(0) to origin. 80ms per item. Spring: stiffness 260, damping 20. |
| Toast | translateY(100%) to translateY(0). Spring: stiffness 300, damping 28. Auto-dismiss 4s. |
| Skeleton shimmer | CSS linear-gradient sliding left-to-right, 1.5s infinite. Pure CSS, no JS. |
| Input focus | Ring scales in with ring-2 ring-accent/20. 200ms ease-out. |
| Nav active | Indicator slides between items via shared layoutId. Spring: stiffness 200, damping 25. |
| Confirmation | Button morphs text/color with spring layout transition. Auto-reverts 3s. |

**Rules:**
- All springs use Framer Motion. No linear easing.
- Hover/active animations use only `transform` and `opacity` (GPU-safe).
- No scroll-linked animations (MOTION_INTENSITY 6 stays in fluid CSS territory).
- Continuous animations (shimmer) must be CSS-only, isolated from React render cycle.

---

## 10. Interactive States

Every component must implement:
- **Loading:** Skeleton loaders matching the exact layout dimensions of the component they replace.
- **Empty:** Composed empty states with Phosphor Light icon, title, description, and optional action.
- **Error:** Inline error text below form fields (error color). Toast for API errors.
- **Disabled:** Reduced opacity (0.5), no pointer events, no hover effects.

---

## 11. Icon System

- Library: `@phosphor-icons/react` (Light weight, strokeWidth 1.5)
- Sizes: 16px for inline, 20px for buttons, 24px for nav items, 48px for empty states
- No emoji anywhere. No FontAwesome. No Material Icons.

---

## 12. Scrollbar

- Track: transparent (or background token on scroll)
- Thumb: `rgba(28, 25, 23, 0.15)`
- Thumb hover: `rgba(28, 25, 23, 0.3)`
- Width: 6px
- Border-radius: 3px (pill shape)
- Cross-browser: both `scrollbar-*` properties and `::-webkit-scrollbar`
- Invisible until scroll, fades out after 1.5s idle

---

## 13. Anti-patterns (Banned)

- No Inter, Roboto, or Arial fonts
- No purple/violet accent colors
- No gradient text
- No neon outer glows
- No `#000000` pure black
- No emoji in UI
- No centered hero layouts (variance 8 = asymmetric)
- No 3-column equal card grids
- No generic names in demo data ("John Doe", "Acme Corp")
- No "Elevate", "Seamless", "Unleash" copy
- No h-screen (use min-h-[100dvh])
- No default Tailwind blue (#3B82F6 is fine as it is calibrated, but default blue-500 out of the box with no customization is not)
- No Unsplash URLs (use picsum.photos if needed)
