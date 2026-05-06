# UI Design Reference

## Visual Direction: "Ink & Wind"

Japanese minimalism meets modern dark UI. Clean but with soul.
The manga covers are the visual focus — everything else recedes.

## Design Tokens

| Token | Value |
|-------|-------|
| Background (dark) | `#0d0b14` (purple-tinted black) |
| Background (light) | `#fafafa` |
| Surface (dark) | `white/5` opacity layers |
| Primary accent | `#8b5cf6` (purple) |
| Font body | Inter |
| Font headings | Poppins |

## Signature Elements

### Noise Overlay
SVG fractalNoise texture, fixed fullscreen, pointer-events none.
- Light mode: 3% opacity
- Dark mode: 5% opacity

### Ink Dividers
Horizontal dividers use a center-fade gradient with primary color:
```css
background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2) 50%, transparent);
```

### Card Vignette
Cover cards have an inset box-shadow to feel embedded:
```css
box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
```

### Watermark
"風の漫画" as decorative background text at 3-4% opacity on empty states.

## Navigation

### Mobile (< 768px)
- **Floating bottom bar**: positioned `bottom-6 left-6 right-6`
- `rounded-3xl`, glassmorphism (`backdrop-blur-2xl`, `bg-black/60`)
- 3 tabs: Search, Library, Settings
- Active indicator: small dot below icon
- Subtle top-edge glow (1px gradient, primary at 10% opacity)

### Desktop (≥ 768px)
- **Top bar**: fixed, glassmorphism (`bg-white/40 dark:bg-zen-dark/40`)
- Logo "Kaze" + small "風の漫画" subtitle
- Nav items with dot indicator (animated layoutId)

## Pages

### Search (Home)
- Large "Kaze" title on mobile (hidden on desktop, shown in navbar)
- Tall search input (`h-16`), `rounded-xl`, focus ring with primary
- Results: 2 columns mobile, 4-6 desktop
- Empty state: Wind icon (20% opacity) + "Search for your next journey" + watermark

### Manga Detail
- Blurred cover as hero background (blur 100px, 30% opacity, gradient fade to bg)
- Cover image: `rounded-xl`, heavy shadow
- Source badge (pill, primary/10 bg)
- "Add to Collection" CTA: primary bg, shadow with primary glow
- Chapter list with vertical progress line (2px, primary for read, neutral for unread)
- Chapter dots: filled primary when read, hollow when unread

### Library
- Title + accent underline bar (primary, 12px wide)
- Filter tabs: animated pill background (layoutId), glassmorphism container
- Grid: 2 columns mobile, 5-6 desktop
- Unread badge: primary pill with pulse-glow animation
- Empty state: "Nothing here yet" + watermark "まだ何もない"

### Reader
- Fullscreen, pure black background
- Tap to toggle header/footer (animated slide in/out)
- Scroll progress bar at top: primary color with glow shadow
- Page-edge shadows between images (gradient top/bottom)
- Header: back button + manga title + chapter label
- Footer: prev/next chapter + page counter pill

### Settings
- Simple card list: Appearance toggle, Account info, Sign out
- Toggle: animated spring dot
- Minimal spacing, `rounded-xl` cards
- Version footer: "Kaze no Manga v0.1.0" muted text

## Motion

- Page transitions: scale 0.98→1, opacity fade, ease-out curve `[0.22, 1, 0.36, 1]`
- Cards: hover lift (`y: -6`), tap scale (0.98), spring physics
- Nav indicators: `layoutId` for smooth position transitions
- Reader bars: slide in/out with opacity
- Tabs: animated pill follows active tab

## Typography Hierarchy

- Page titles (h1): `font-black`, 4xl mobile / 6-7xl desktop
- Section titles (h2): `font-bold`, 2xl-3xl
- Card titles: `font-semibold`, xs-sm
- Labels: `font-bold`, 10px uppercase tracking-wider
- Body: `font-medium`, base size

## Dark Mode

Dark mode is the **primary experience**. Light mode is secondary.
Dark uses purple-tinted blacks (`#0d0b14`) not pure black.
