# UI Design

> This document is a **starting direction**, not a final spec.
> The actual design will be validated and refined during Wave 1 (Shell UI).

## Visual Direction: "Ink & Wind"

Japanese minimalism meets modern dark UI. Manga covers are the visual focus.

## Design Tokens (draft)

| Token | Value |
|-------|-------|
| Background (dark) | `#0d0b14` (purple-tinted black) |
| Background (light) | `#fafafa` |
| Surface (dark) | `white/5` opacity layers |
| Primary accent | `#8b5cf6` (purple) |
| Font body | Inter |
| Font headings | Poppins |

## Key Elements (to validate)

- **Noise overlay**: SVG fractalNoise texture (3-5% opacity)
- **Ink dividers**: center-fade gradient with primary color
- **Card vignette**: inset box-shadow on cover cards
- **Glassmorphism nav**: backdrop-blur + semi-transparent bg

## Navigation (to validate)

- Mobile: floating bottom bar (3 tabs)
- Desktop: top bar with logo + nav items

## Pages

- Search (home)
- Manga Detail
- Library
- Reader
- Settings (minimal)

## Dark Mode

Dark mode is the **primary** experience. Light mode is secondary.

## Motion (to validate)

- Page transitions: scale + opacity
- Cards: hover lift, tap scale
- Nav indicators: animated position
- Reader bars: slide in/out
