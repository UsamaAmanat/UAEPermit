# Global Color System

All colors are now centralized for easy maintenance and future updates.

## Color Palette

```
Primary Navy:   #3C4161  (main brand color)
Accent Teal:    #62E9C9  (interactive elements, highlights)
Dark Teal:      #0c4d3d  (dark backgrounds, emphasis)
```

## Usage Methods

### 1. **Tailwind Classes (CSS)** - Recommended for JSX components

Use the theme-defined color names:

```tsx
// Backgrounds
<div className="bg-navy">...</div>
<div className="bg-teal">...</div>
<div className="bg-dark-teal">...</div>

// Text colors
<span className="text-navy">Primary text</span>
<span className="text-teal">Accent text</span>
<span className="text-dark-teal">Dark text</span>

// Borders
<div className="border border-teal">...</div>
<div className="border-2 border-navy">...</div>

// With opacity
<div className="bg-teal/20">...</div>
<div className="text-navy/80">...</div>

// Hover states
<button className="bg-teal hover:opacity-90">...</button>
```

### 2. **Color Constants** - For non-CSS contexts

Import from `@/lib/colors` for places where CSS classes don't work:

```tsx
import { COLORS } from "@/lib/colors";

// Icons and graphics
<Heart color={COLORS.primary.teal} />
<AlertCircle color={COLORS.text.accent} />

// Stripe configuration
const appearance = {
  variables: {
    colorPrimary: COLORS.button.primary,
  }
};

// Confetti
confetti({
  colors: [
    COLORS.primary.navy,
    COLORS.primary.teal,
    COLORS.primary.darkTeal,
  ],
});

// Inline styles (discouraged but sometimes necessary)
<div style={{ color: COLORS.text.primary }}>...</div>
```

### 3. **Shadow with Brand Colors**

```tsx
// Teal glow
<div className="shadow-[0_20px_60px_rgba(98,233,201,0.15)]">...</div>

// Navy shadow
<div className="shadow-[0_14px_35px_rgba(60,65,97,0.45)]">...</div>

// Dark teal shadow
<div className="shadow-[0_30px_90px_rgba(12,77,61,0.15)]">...</div>
```

## Color Color Map

| Use Case            | Tailwind Class   | Hex Value | CSS Variable        |
| ------------------- | ---------------- | --------- | ------------------- |
| Primary Backgrounds | `bg-navy`        | #3C4161   | `--color-navy`      |
| Primary Text        | `text-navy`      | #3C4161   | `--color-navy`      |
| Accent/Buttons      | `bg-teal`        | #62E9C9   | `--color-teal`      |
| Accent Text         | `text-teal`      | #62E9C9   | `--color-teal`      |
| Dark Backgrounds    | `bg-dark-teal`   | #0c4d3d   | `--color-dark-teal` |
| Dark Text           | `text-dark-teal` | #0c4d3d   | `--color-dark-teal` |
| Semantic Primary    | `bg-primary`     | #3C4161   | `--color-primary`   |
| Semantic Secondary  | `bg-secondary`   | #62E9C9   | `--color-secondary` |
| Semantic Tertiary   | `bg-tertiary`    | #0c4d3d   | `--color-tertiary`  |

## Updating Colors

To change the theme globally:

1. **Update `src/lib/colors.ts`** - for non-CSS contexts
2. **Update `src/app/globals.css`** - for Tailwind colors

Both files contain the same color values and should be kept in sync.

Example workflow to change teal to a different color:

**File: `globals.css`**

```css
--color-teal: #NEW_COLOR_HEX;
```

**File: `colors.ts`**

```typescript
teal: "#NEW_COLOR_HEX",
```

Then regenerate Tailwind cache if needed (usually automatic in dev mode).

## Common Patterns

### CTA Buttons

```tsx
<button className="bg-teal text-dark-teal hover:opacity-90">Click me</button>
```

### Cards with Navy Header

```tsx
<div className="rounded-lg border border-teal">
  <div className="bg-navy text-white p-4">Header</div>
  <div className="p-4">Content</div>
</div>
```

### Gradient Background

```tsx
<div className="bg-gradient-to-r from-navy to-dark-teal">...</div>
```

### Colored Accent Line (Breadcrumb Example)

```tsx
<span className="h-1.5 w-1.5 rounded-full bg-teal" />
```

### Hover with Brand Colors

```tsx
<div className="border border-slate-200 hover:border-teal hover:bg-teal/10">
  ...
</div>
```

## Notes

- All hardcoded hex colors (#3C4161, #62E9C9, #0c4d3d) should be replaced with the Tailwind classes or the color constants
- Use opacity modifiers (`/10`, `/20`, etc.) rather than trying to create custom opacity values
- For dynamic color values (Stripe, Confetti, etc.), always import from `@/lib/colors`
- Keep this file updated as a reference guide when making changes
