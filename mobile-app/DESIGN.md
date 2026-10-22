---
name: Arabic Master
# Canonical tokens. tailwind.config.js mirrors these names and values exactly.
# Change both files together. See "Decisions" for how conflicts were resolved.
colors:
  primary: '#15803d'
  on-primary: '#ffffff'
  primary-strong: '#14532d'
  primary-subtle: '#f0fdf4'
  secondary: '#f59e0b'
  on-secondary: '#171717'
  secondary-subtle: '#fef3c7'
  on-secondary-subtle: '#b45309'
  background: '#ffffff'
  on-background: '#171717'
  surface: '#ffffff'
  on-surface: '#171717'
  on-surface-variant: '#737373'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  outline: '#737373'
  outline-variant: '#e5e7eb'
  success: '#15803d'
  on-success: '#ffffff'
  success-container: '#f0fdf4'
  warning: '#b45309'
  on-warning: '#ffffff'
  warning-container: '#fef3c7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  arabic-display:
    fontFamily: Noto Sans Arabic (recommended, not loaded)
    fontSize: 40px
    fontWeight: '500'
    lineHeight: 60px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  container-max: 1200px
---

# Arabic Master — Design System

This file is the **documented design source of truth**. `tailwind.config.js` is its
**executable implementation** and must use the same token names and values.

Reconciled on 2026-10-22 from three sources: this file's previous version (the
supplied spec), the seven onboarding HTML references in `html/onboarding/`, and the
previous `tailwind.config.js`. Decisions are recorded in §11 and unresolved items in §12.

---

## 1. Brand and style

The design system establishes a premium, authoritative, yet approachable educational
environment for mastering practical Arabic. It merges modern educational technology with
the dignity of classical scholarship. The emotional tone evokes academic prestige,
clarity, and steady progression.

The aesthetic is anchored in elevated **minimalism**: generous negative space,
intentional typographic hierarchy, crisp containment, and a restrained color strategy.
Visual clutter is eliminated to reduce cognitive load during linguistic study.

Principles for implementation:

- **Green means meaning.** `primary` is reserved for primary actions, selection,
  progress, and success.
- **Amber is rare.** `secondary` is used only for achievements, streaks, milestones, and
  upgrade triggers.
- **One primary action per screen.** Short copy, generous whitespace.
- **Multi-script first.** Latin, Bengali, and Arabic must all render legibly. Arabic,
  the subject being learned, gets the most typographic care.
- **Touch-first, small-screen-first.** Design for ~360–390 pt wide phones, then adapt.

---

## 2. Colors

> **Rule:** never introduce a raw hex/rgb value, or a default Tailwind palette class
> (`emerald-*`, `green-*`, `slate-*`, `gray-*`, `amber-*`), in app code when a semantic
> token below covers the role. If no token fits, add one here **and** in
> `tailwind.config.js` first.

Use the tokens as NativeWind classes: `bg-<token>`, `text-<token>`, `border-<token>`.

### 2.1 Semantic tokens

| Role | Token | Value | Usage |
| :-- | :-- | :-- | :-- |
| Primary | `primary` | `#15803d` | Primary buttons, selected borders, active progress dot, check badges, text buttons ("Skip") |
| On primary | `on-primary` | `#ffffff` | Text/icons on `primary` |
| Primary strong | `primary-strong` | `#14532d` | Pressed state of primary buttons; text on `primary-subtle` (badges); deep structural accents |
| Primary subtle | `primary-subtle` | `#f0fdf4` | Selected option fill, summary/info cards, active-state containers, icon circles |
| Secondary / accent | `secondary` | `#f59e0b` | Achievements, streaks, milestone badges, upgrade CTA fills. Never use as a text color on light backgrounds |
| On secondary | `on-secondary` | `#171717` | Text/icons on `secondary`. **Not white** (white on amber ≈ 2.1:1) |
| Secondary subtle | `secondary-subtle` | `#fef3c7` | Achievement tag backgrounds |
| On secondary subtle | `on-secondary-subtle` | `#b45309` | Achievement tag text |
| Background | `background` | `#ffffff` | Screen background |
| On background | `on-background` | `#171717` | Text directly on background |
| Surface | `surface` | `#ffffff` | Base layer for sheets and modals |
| Text – primary | `on-surface` | `#171717` | Titles, body, option labels, icons |
| Text – secondary | `on-surface-variant` | `#737373` | Subtitles, helper text, metadata, placeholders |
| Surface – lowest | `surface-container-lowest` | `#ffffff` | Cards, inputs, list rows |
| Surface – low | `surface-container-low` | `#f6f3f2` | Pressed state of white cards, subtle grouping |
| Surface – mid | `surface-container` | `#f0eded` | Inactive progress dots, neutral chips |
| Surface – high | `surface-container-high` | `#eae7e7` | Disabled button fill |
| Surface – highest | `surface-container-highest` | `#e5e2e1` | Skeleton/loading placeholders |
| Border – strong | `outline` | `#737373` | Input borders, unselected radio/checkbox rings (≥ 3:1) |
| Border – subtle | `outline-variant` | `#e5e7eb` | Card borders, dividers (decorative) |
| Success | `success` | `#15803d` | Success icons/text. Intentionally equals `primary` |
| On success | `on-success` | `#ffffff` | Content on `success` |
| Success container | `success-container` | `#f0fdf4` | Success banners. Equals `primary-subtle` |
| Warning | `warning` | `#b45309` | Warning text, icons, borders |
| On warning | `on-warning` | `#ffffff` | Content on a `warning` fill |
| Warning container | `warning-container` | `#fef3c7` | Warning banner background (text: `text-warning`) |
| Error | `error` | `#ba1a1a` | Error text, error borders, destructive actions |
| On error | `on-error` | `#ffffff` | Content on `error` |
| Error container | `error-container` | `#ffdad6` | Error banners and field backgrounds |
| On error container | `on-error-container` | `#93000a` | Text on `error-container` |

There is no hover color. Mobile uses pressed states (§6).

### 2.2 Contrast (approximate WCAG ratios, computed)

| Foreground on background | Ratio | Result |
| :-- | :-- | :-- |
| `on-primary` on `primary` | ≈ 5.0:1 | AA |
| `on-primary` on `primary-strong` | ≈ 9.1:1 | AAA |
| `primary` on `primary-subtle` | ≈ 4.9:1 | AA |
| `primary-strong` on `primary-subtle` | ≈ 8.8:1 | AAA |
| `on-surface` on white | ≈ 18:1 | AAA |
| `on-surface-variant` on white | ≈ 4.7:1 | AA |
| `on-surface-variant` on `surface-container-low` | ≈ 4.3:1 | **Fails** for small text. Use `on-surface` on tinted gray fills |
| `on-secondary` on `secondary` | ≈ 8.3:1 | AAA |
| `on-secondary-subtle` / `warning` on `secondary-subtle` | ≈ 4.6:1 | AA |
| `on-warning` on `warning` | ≈ 5.0:1 | AA |
| `error` on white | ≈ 6.5:1 | AA |

---

## 3. Typography

### 3.1 Font availability (verified 2026-10-22)

**No custom fonts are installed or loaded.** Evidence:

- no `@expo-google-fonts/space-grotesk`, `plus-jakarta-sans`, `noto-sans-arabic`, or
  `noto-sans-bengali` package exists in `package.json` or `node_modules` (only
  `@expo-google-fonts/material-symbols`, a transitive dependency of `expo-symbols`);
- `assets/` contains no `.ttf`/`.otf` files;
- `src/` has no `useFonts` / `expo-font` loading code.

The font-family keys in `tailwind.config.js` (`SpaceGrotesk_*`, `PlusJakartaSans_*`,
`NotoSansArabic_*`) are **placeholders in `@expo-google-fonts` naming**. Until fonts are
loaded, every `font-*` class falls back to the platform system font. Don't describe these
fonts as available.

| Use | Family | Source |
| :-- | :-- | :-- |
| Headlines | Space Grotesk | Spec |
| Body and UI labels | Plus Jakarta Sans | Spec (also used by `firstPage.html` and `welcomeScreen.html`) |
| Arabic script | Noto Sans Arabic (recommended) | Not in the spec. Taken from the HTML references (§12) |
| Bengali script | Noto Sans Bengali (recommended) | Not in the spec. Taken from `firstPage.html`; system fallback renders Bengali on iOS and Android |

### 3.2 Type scale

Each size class (`text-<token>`) carries its own line height, weight, and letter spacing.
To get the intended font once it is loaded, pair it with the matching family class
(`font-<token>`).

| Token | Size / line height | Weight | Use |
| :-- | :-- | :-- | :-- |
| `headline-xl` | 48 / 56, −0.03em | 700 | Large hero numbers (tablet) |
| `headline-xl-mobile` | 36 / 44, −0.02em | 700 | Celebration numbers (XP) |
| `headline-lg` | 36 / 44, −0.02em | 600 | Tablet screen titles |
| `headline-lg-mobile` | 28 / 36, −0.01em | 600 | Welcome hero title, "You're all set!" |
| `headline-md` | 24 / 32, −0.01em | 600 | **Onboarding question titles**, screen titles |
| `headline-sm` | 20 / 28 | 600 | Section headings ("Save your progress") |
| `body-lg` | 18 / 28 | 400 | Emphasised body text |
| `body-md` | 16 / 24 | 400 | Default body, option labels |
| `body-sm` | 14 / 20 | 400 | Subtitles, helper text, card descriptions |
| `label-lg` | 14 / 20, 0.01em | 600 | Button labels, option titles, text buttons |
| `label-md` | 12 / 16, 0.02em | 600 | Stat labels, badges, captions |
| `label-sm` | 11 / 14, 0.04em | 600 | Non-essential micro labels only |
| `arabic-display` | 40 / 60 | 500 | The Arabic word or sentence being taught |

Rules:

- Do not use arbitrary sizes (`text-[25px]`). Map HTML values to the nearest token:
  24–25 px → `headline-md`, 28 px → `headline-lg-mobile`, 17 px → `headline-sm` or
  `body-lg`, 15–16 px → `body-md`, 14 px → `body-sm` / `label-lg`, 12–13.5 px →
  `body-sm` / `label-md`, 11 px → `label-md`.
- Keep `allowFontScaling` enabled (the React Native default). Layouts must survive
  large accessibility text sizes.
- `letterSpacing` in `em` and `fontWeight` inside `fontSize` tuples came from the
  previous config. Their exact NativeWind rendering on device has not been verified.

### 3.3 Arabic and Bengali

- Arabic line height must be **20–25% taller** than the Latin token at the same size,
  to fit ascenders, descenders, and tashkeel (diacritics). For example, Arabic shown at
  `body-lg` size uses ~34–35 px line height. Apply this with a style `lineHeight`
  override until dedicated Arabic body tokens exist.
- Render Arabic noticeably larger than the surrounding Latin text. Use `arabic-display`
  for the taught item and at least `body-lg` size for inline Arabic.
- Set `writingDirection: 'rtl'` on Arabic-only `Text`. Do not mirror the whole layout;
  the UI language (Bengali or English) is LTR.
- **Never letter-space connected Arabic text** (no `tracking-*`). It breaks cursive
  joining. Isolated logo letters (`ا ب ت`) are the only exception.
- Transliteration goes directly under the Arabic, in `body-md` / `on-surface-variant`.
- Bengali uses the same size tokens as English. Avoid Bengali below 14 px.

---

## 4. Layout and spacing

The layout follows an 8 px base rhythm, with 4 px half-steps.

| Token | Value | Use |
| :-- | :-- | :-- |
| `space-xs` | 4 | Icon-to-text gaps in badges |
| `space-sm` | 8 | Title→subtitle gap, progress-dot gap |
| `space-md` | 16 | Card padding, gaps between option cards, header→content |
| `space-lg` | 24 | Gaps between major sections; large card padding |
| `space-xl` | 40 | Hero→content separation, empty states |
| `margin` | 20 | **Mobile screen horizontal padding** (`px-margin`) |
| `gutter` | 16 | Gap between grid columns (goals grid) |
| `margin-tablet` / `gutter-tablet` | 32 / 24 | 768–1024 pt widths |
| `margin-desktop` / `gutter-desktop` | 48 / 32 | > 1024 pt (web) |
| `container-max` | 1200 | Max content width (web) |

- Mobile (< 768 pt): a single vertical flow with `px-margin`, and a bottom action area
  that respects the safe-area inset.
- Tablet: content may split into two columns, e.g. lesson text beside practice. For
  onboarding forms, cap the content width at ~480 pt and center it.
- Prefer the named tokens. Tailwind's default numeric scale is allowed only for values
  on the 4-pt grid that have no named token (e.g. `gap-3` = 12). No arbitrary pixel
  values.

---

## 5. Shape, borders, elevation, icons

**Radii.** These override Tailwind's defaults: `rounded-lg` is 16 and `rounded-xl` is 24
here, not 8 and 12.

| Class | Value | Use |
| :-- | :-- | :-- |
| `rounded-sm` | 4 | Checkboxes, tiny tags |
| `rounded` | 8 | **Buttons, inputs, option cards, standard controls** |
| `rounded-md` | 12 | Grid cards (goals), icon tiles |
| `rounded-lg` | 16 | Large lesson panels, summary cards |
| `rounded-xl` | 24 | Modals, bottom sheets |
| `rounded-full` | 9999 | Pills, badges, progress dots, radios, avatars |

Don't use Tailwind defaults that sit outside this scale (`rounded-2xl`, `rounded-3xl`).

**Borders.** Unselected cards use `border border-outline-variant`. Selected or focused
cards use `border-2 border-primary`, and selected cards add `bg-primary-subtle`. Inputs
use `border border-outline`, which becomes `border-primary` on focus.

**Elevation.** Shadows are soft and emerald-tinted. They are **not mapped to Tailwind
classes**; NativeWind support for these multi-layer values is unverified, so apply them
through a style only after checking iOS and Android:

- Level 1 (cards): `0 2px 8px -2px rgba(20,83,45,0.04), 0 1px 3px 0 rgba(0,0,0,0.02)`
- Level 2 (interactive/selected): `0 8px 24px -4px rgba(20,83,45,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)`
- Level 3 (modals/sticky overlays): `0 20px 32px -8px rgba(20,83,45,0.12), 0 4px 12px -2px rgba(0,0,0,0.05)`

Prefer borders when in doubt. Never rely on a shadow alone to show state.

**Icons.** Use `lucide-react-native` (installed). Sizes are 16 (inline/footnotes), 20
(buttons, list rows, radios), and 24 (card/feature icons). Color comes from tokens:
`primary` when active or selected, `on-surface-variant` otherwise.

---

## 6. Components

### Buttons
All buttons have a minimum height of 48 pt (`min-h-12`), `rounded` (8) corners,
`px-space-lg` horizontal padding, and a `text-label-lg` label.

| Variant | Classes | Pressed |
| :-- | :-- | :-- |
| Primary | `bg-primary` + `text-on-primary` | `bg-primary-strong` |
| Secondary (outline) | `bg-surface border border-primary` + `text-primary` | `bg-primary-subtle` |
| Accent (milestones/upgrade only) | `bg-secondary` + `text-on-secondary` | opacity 0.9 |
| Text button | `text-primary`, `hitSlop` to ≥ 48×48 | opacity 0.7 |
| Destructive | `bg-error` + `text-on-error` | opacity 0.9 |
| Disabled (any) | `bg-surface-container-high` + `text-on-surface-variant` | — |

Set `accessibilityRole="button"` and `accessibilityState={{ disabled, busy }}`. While a
submission is pending, show an `ActivityIndicator` and block repeat presses. Don't use
scale animations by default.

### Option cards (single-select)
- Unselected: `bg-surface-container-lowest border border-outline-variant rounded
  p-space-md`, with a trailing 20 pt ring `rounded-full border-2 border-outline`.
- Selected: `bg-primary-subtle border-2 border-primary`, with a trailing 20 pt
  `bg-primary rounded-full` circle containing a white check icon.
- Accessibility: `accessibilityRole="radio"` + `accessibilityState={{ checked }}`. Wrap
  the group in `accessibilityRole="radiogroup"` with a label.

### Multi-select cards (goals grid)
- Two columns separated by `gap-gutter`, using `rounded-md` cards and the same
  selected/unselected visuals.
- `accessibilityRole="checkbox"` + `accessibilityState={{ checked }}`.
- Helper text such as "You can select multiple goals." goes in
  `text-body-sm text-on-surface-variant`.

### Text fields and search
`bg-surface-container-lowest border border-outline rounded min-h-12 px-space-md
text-body-md text-on-surface`. Placeholder color is `on-surface-variant`. On focus, use
`border-primary`; the spec's 3 px soft ring is optional and only via style. Always
provide a visible label or `accessibilityLabel`. In the error state, use `border-error`
and put the message below the field in `text-label-md text-error`.

### Cards
`bg-surface-container-lowest border border-outline-variant`, `rounded-lg` for panels or
`rounded` for list cards, with `p-space-lg` padding (`p-space-md` in dense lists).
Summary/info cards use `bg-primary-subtle`.

### Chips and badges
`rounded-full px-3 py-space-xs` (12 / 4 pt), with `text-label-md`.
- Progress/category: `bg-primary-subtle text-primary-strong`.
- Achievement: `bg-secondary-subtle text-on-secondary-subtle`.
- Neutral: `bg-surface-container text-on-surface`.

### Checkboxes and radios
20 pt controls. Checkboxes use `rounded-sm`; radios use `rounded-full`. Unselected:
1.5–2 pt `border-outline`. Selected: solid `bg-primary` with a white icon.

### Progress indicator (onboarding)
A row of dots with `gap-space-sm`. The active dot is 10 pt `bg-primary`. Completed dots
are 8 pt `bg-primary` with `opacity-40`, and upcoming dots are 8 pt
`bg-surface-container`. Expose it as `accessibilityRole="progressbar"` with
`accessibilityValue={{ min: 1, max: N, now: i }}`, or label it "Step i of N".

### Feedback states
- Loading: `ActivityIndicator` in `primary`, or skeletons in
  `surface-container-highest`.
- Empty: icon + `text-body-md` message + optional primary action.
- Error: `bg-error-container` banner, `text-on-error-container`, retry action.
- Warning: `bg-warning-container` banner, `text-warning`.
- Success: white check on a `success` circle, on a `success-container` halo.
- Never use color alone. Always pair it with an icon and/or text.

---

## 7. Accessibility and responsive behavior

- Touch targets must be at least **48×48 pt**. Use `hitSlop` for "Skip", back arrows, and
  other small controls.
- Every interactive element needs an `accessibilityRole`. Icon-only controls also need
  an `accessibilityLabel` (e.g. "Go back").
- Expose selection with `accessibilityState`, not only with color.
- Announce validation errors and async results
  (`AccessibilityInfo.announceForAccessibility`).
- Contrast: text ≥ 4.5:1 and UI boundaries ≥ 3:1 (§2.2).
- Use `react-native-safe-area-context` (installed) for insets. Don't draw fake status
  bars or home indicators.
- Content must scroll when it doesn't fit. The primary CTA stays reachable.
- Use keyboard avoidance on screens with inputs, e.g. country search.
- Test at 360 pt and 390+ pt widths and with large text, on both iOS and Android.
- Hide decorative graphics from screen readers (`accessible={false}`,
  `importantForAccessibility="no-hide-descendants"`).

---

## 8. Onboarding rules

HTML references (content and visual reference only, **not** a token source):

| File | Step | Notes |
| :-- | :-- | :-- |
| `welcomeScreen.html` | Entry | "I already have an account" / "I'm new here" |
| `firstPage.html` | Language | বাংলা / English, single-select |
| `secondPage.html` | Country | Search + 7 countries, single-select |
| `thirdPage.html` | Learning goals | Multi-select grid |
| `fouthPage.html` | Daily practice time | Single-select; CTA "Start Learning" |
| `fifthScreen.html` | — | **Byte-identical duplicate of `fouthPage.html`** |
| `completeScreen.html` | Completion | Summary card, account benefits, "Create an account" / "Continue as guest" |

1. Shared layout, in order:
   - header with a back button (omitted on the first step), progress dots, and a
     "Skip" text button;
   - title in `text-headline-md text-on-surface`;
   - subtitle in `text-body-sm text-on-surface-variant`;
   - options, then a full-width primary button in the bottom action area.
2. Every step uses the same dot count and styling (§12, item 2).
3. Single-select steps use option cards; goals use multi-select cards. The selected state
   is always `border-primary` + `bg-primary-subtle`.
4. "Continue" stays disabled until the step is valid.
5. Don't infer a dialect from the country (product rule in `whole.mobile.ui.md`).
6. Don't reproduce mockup chrome: status bars, home indicators, device frames.
7. Decorative bursts and waves are optional. They must use tokens and be hidden from
   accessibility.
8. The summary card on the completion screen uses `bg-primary-subtle` with
   `outline-variant` dividers.

---

## 9. HTML-to-Expo conversion rules

1. **HTML is a visual and content reference, not a style source.** Don't copy its
   literal colors (`#047857`, `#15803d` written as a literal, `#0f6139`, `#1b7a52`,
   `#0f5b38`, `#056839`, …), its per-file `brand` palettes, or its font stacks. Map
   every value to the semantic token for its role (§2), and convert sizes, spacing, and
   radii with §3–§5. Note that `rounded-xl` in the HTML (12 px) corresponds to
   `rounded-md` in the app.
2. Use the canonical NativeWind token classes for anything a token represents.
3. Don't copy the Tailwind CDN script, inline `tailwind.config`, `<style>` blocks, or
   HTML elements. Don't copy browser-only utilities either: `hover:`, `group-hover:`,
   `sr-only`, `select-none`, `cursor-*`, `transition-*`, `active:scale-*`,
   `space-x/y-*` (use `gap-*`), `divide-*`, CSS-border triangles, and `<br/>` line
   breaks.
4. Use React Native primitives (`View`, `Text`, `Pressable`, `TextInput`, `ScrollView`,
   and `FlatList` for long lists) plus the installed libraries: `lucide-react-native`
   (icons), `react-native-svg` (logo/illustrations), `expo-image` (raster images), and
   `react-native-safe-area-context` (insets).
5. Preserve the content, hierarchy, and interaction intent. Adapt the screen for safe
   areas, scrolling, keyboard behavior, accessibility roles and states, and iOS/Android
   differences.
6. Inspect `src/app/` and any existing component folders before choosing where a screen
   lives. Routes belong only in `src/app/`. Don't create duplicate screens or change
   navigation without a clear requirement.
7. Extract shared components (option card, progress dots, bottom CTA) only once two or
   more screens actually use them.

---

## 10. Implementation notes

- NativeWind 4 + Tailwind 3 are wired through `babel.config.js`
  (`jsxImportSource: "nativewind"`, `nativewind/babel`), `metro.config.js`
  (`withNativeWind`, input `./global.css`), and `global.css`. Tailwind scans
  `./src/**/*.{js,jsx,ts,tsx}` only.
- `global.css` is currently imported in `src/app/index.tsx`. Move the import to
  `src/app/_layout.tsx` when more routes are added.
- `src/app/index.tsx` is the template placeholder. It uses `text-green-500` (a non-token
  class) and `text-bold` (not a valid utility), and is not part of this system yet.

---

## 11. Decisions and rationale

| # | Conflict | Decision | Rationale |
| :-- | :-- | :-- | :-- |
| D1 | Primary: spec prose `#15803D`, spec frontmatter `#00652c`, old config `#006d37`, HTML has 10+ greens | **`#15803d`** | The spec prose names it explicitly as the brand primary. The old frontmatter lists `#15803d` as `primary-container`, which shows it was the seed of the generated palette and that `#00652c` is a derived tone. It is also the most common green across the HTML (4 files). White text on it passes AA (≈ 5.0:1) |
| D2 | Hover `#16A34A` (spec) | Not adopted; pressed = `primary-strong` `#14532d` | Mobile has no hover. White on `#16a34a` is ≈ 3.3:1 and fails AA. `#14532D` is the spec's own deep green |
| D3 | Secondary: prose `#F59E0B`, frontmatter `#855300`, old config grey `#586062` | **`#f59e0b`**, with `on-secondary` `#171717` | The prose names amber as the accent and specifies `#171717` text. Amber + white fails contrast |
| D4 | Surface: prose white, frontmatter `#fcf9f8`, old config `#f8f9fa` | **`#ffffff`** background/surface | The prose explicitly calls pure white the foundational canvas, which also matches the HTML screens |
| D5 | Tint: prose `#F0FDF4`, HTML mostly `#ebf7ee` | **`primary-subtle` `#f0fdf4`** | The spec is explicit. Primary text on it still passes AA |
| D6 | Text colors: prose `#171717`/`#737373`, frontmatter `#1c1b1b`/`#3f493f`, HTML slate/gray mixes | **`#171717`** / **`#737373`** | The prose is explicit, and both pass AA on white |
| D7 | Surface container levels | Kept the spec frontmatter values | The prose doesn't define them; the frontmatter is the spec's only source |
| D8 | Control borders: spec `#D1D5DB` | `outline` = **`#737373`**; card borders `outline-variant` = `#e5e7eb` | `#d1d5db` on white is ≈ 1.5:1 and fails WCAG 1.4.11 for inputs and radio rings. `#737373` is the spec neutral it assigns to "subtle borders" |
| D9 | Warning: none in the spec | `warning` `#b45309`, `warning-container` `#fef3c7` | Reuses the spec's amber-tag pair instead of inventing a color, and it is text-safe. Open: see §12 |
| D10 | Success: none in the spec | `success` = `primary`, container = `primary-subtle` | Success is always brand green in the references |
| D11 | Type scale: old config (`display-lg`, `label-md` = 14, `headline-lg` = 32, Inter body) vs spec | **Spec scale and names**; kept `arabic-display` | The spec is explicit. No app code used the old names (verified in `src/`) |
| D12 | Radii: old config (`DEFAULT` 4, `lg` 8, `xl` 12) vs spec | **Spec radii** | The spec defines 8 for controls, 16 for panels, 24 for modals |
| D13 | Spacing: old config (`xs` = 8, `md` = 24, `gutter` = 20, …) vs spec (`space-*`, `margin`, `gutter` = 16) | **Spec spacing**, plus `container-max` | Keeping both would leave contradictory scales (`xs` = 8 vs `space-xs` = 4) |
| D14 | Touch target: 44 (common guideline) vs spec 48 | **48** | The spec is explicit |
| D15 | Removed generated Material 3 extras (`*-fixed*`, `inverse-*`, `tertiary*`, `surface-tint`, `surface-dim/bright/variant`, `primary-container`, …) | Removed from the config | They duplicated or contradicted the canonical palette and were unused |

The previous spec version is backed up outside the repo, in the agent scratch folder,
and is also recoverable from this conversation.

---

## 12. Open questions

1. **Fonts not loaded.** Recommended next step, once dependency changes are authorized:
   install with Bun and load through `expo-font`:
   - Space Grotesk (600, 700)
   - Plus Jakarta Sans (400, 600)
   - Noto Sans Arabic (500, 700)
   - Noto Sans Bengali (500, 600)

   Then verify the family keys in `tailwind.config.js`. On Android, custom families
   usually need one family name per weight instead of relying on `fontWeight`.
2. **Progress dot count.** The HTML shows 6 dots, and the active step jumps from 3 to 5.
   The flow spec has 5 data steps: Language, Country, Goals, Arabic Level, Daily
   Practice. Recommendation: 5 dots, with no dots on the welcome and completion screens.
3. **Arabic Level step has no HTML reference.** `fifthScreen.html` duplicates
   `fouthPage.html`. Recommendation: build the step from `whole.mobile.ui.md` §3.4 using
   option cards with a description line.
4. **Goal options differ.** `thirdPage.html` lists Everyday conversation, Making friends,
   Travel, and Understanding people around me; `whole.mobile.ui.md` lists Daily Life,
   Speaking with People, and General Learning. Product decision needed.
5. **Last-step CTA:** "Start Learning" (HTML) vs "Continue" (spec).
6. **Warning color:** confirm that `#b45309` is acceptable as the warning color, or
   supply a dedicated one.
7. **Platform branding:** `app.json` still uses Expo template blues (splash `#208AEF`,
   Android adaptive icon background `#E6F4FE`). Not changed here. Recommendation: align
   with `primary` and `background` in a separate task.
8. **Dark mode:** `app.json` sets `userInterfaceStyle: "automatic"`, but only light tokens
   exist. Recommendation: set `"light"` or define dark tokens before release.
9. **Arabic body tokens:** consider adding `arabic-body` tokens (e.g. 20/32) once Arabic
   lesson screens are designed.