# Task: Create a Consistent Design System for Arabic Master

You are working in my existing Expo React Native project. First inspect the repository and reconcile its onboarding HTML references, current design specification, and actual NativeWind/Tailwind configuration into one consistent design system.

Do not start by converting screens. First establish the canonical design system that future HTML-to-Expo conversions must follow.

## Project context to verify

The project is expected to use:
- Expo SDK 56
- Expo Router with route files under `src/app/`
- NativeWind and Tailwind CSS
- `tailwind.config.js` and `global.css`
- Bun lockfile: `bun.lock`

Treat these as starting facts. Verify them against the actual files before relying on them. Do not install packages or upgrade dependencies.

## Sources to inspect

1. Inspect all onboarding HTML files under `html/onboarding/`.
2. Find and read the current design specification. It may be named `design.md`, may be supplied as an attachment, or may be included in this request. If you cannot access it, say so clearly; do not invent its contents.
3. Inspect `tailwind.config.js`, `global.css`, Babel and Metro configuration, `app.json`, `package.json`, the Expo routes, available fonts, and relevant assets.
4. Check whether there are existing shared UI components or design-token files before creating new ones.

## Important design reconciliation

The HTML screens contain inconsistent colors and styles. Examples include greens such as `#047857`, `#15803d`, `#0f6139`, and `#1b7a52`. The supplied design specification and current Tailwind config also disagree on some token values.

Do not preserve these conflicting values as separate screen-specific styles. Instead:

1. Inventory the repeated visual patterns and conflicting values across all HTML files, the design spec, and the app configuration.
2. Establish one canonical token for each semantic role: primary, primary foreground, secondary/accent, background, surface levels, text, border, success, warning, and error.
3. Select one canonical value per token. Prefer the supplied design specification when it clearly expresses the intended brand. If sources conflict or the evidence is ambiguous, make a reasoned recommendation and record the decision and rationale in the design document.
4. Do not silently invent brand colors, fonts, endpoints, or UI conventions.
5. Preserve the HTML content, information hierarchy, and interaction intent as reference material. Normalize visual styling to the approved canonical system.

## Deliverables

### A. Canonical `design.md`

Create or carefully update the project’s canonical `design.md`. Keep it practical and usable by future coding agents. Include:

- Brand intent and visual principles
- Semantic color tokens with exact values and usage rules
- Typography roles, font names, weights, sizes, line heights, and Arabic-script guidance
- Spacing scale and mobile layout rules
- Corner radii, borders, elevation/shadows, and icon sizing
- Component guidance for buttons, cards, fields, selectors, badges, and feedback states
- Accessibility requirements, touch target guidance, and responsive behavior
- Rules for onboarding screens
- A clear rule that raw, one-off color values should not be introduced when a semantic token exists
- Any unresolved decisions or fonts that are not available in the project

Avoid contradictory duplicate palettes. Keep tokens semantic so screens use roles such as `primary` or `surface`, not arbitrary shades chosen per screen.

### B. NativeWind/Tailwind token mapping

Update `tailwind.config.js` only as needed to mirror the canonical design tokens from `design.md`.

- Keep `design.md` as the documented design source of truth and the Tailwind theme as its executable implementation.
- Ensure semantic tokens can be reused through NativeWind classes, for example `bg-primary`, `text-on-surface`, or the project’s equivalent naming.
- Map typography and spacing tokens only when the existing NativeWind/Tailwind setup supports them.
- Do not add a new styling library or package.
- Do not claim a font is available or loaded unless you verify its font file and setup.
- Keep the existing NativeWind Babel, Metro, and stylesheet integration intact.
- Avoid replacing the entire Tailwind configuration if a focused edit is sufficient.

### C. Future HTML-to-Expo conversion rules

Add a concise section to `design.md` explaining how to convert the onboarding HTML into Expo React Native:

- Treat HTML as a visual/content reference, not as permission to introduce new colors or styles.
- Reuse canonical NativeWind token classes for all values represented by design tokens.
- Do not copy Tailwind CDN configuration, HTML elements, browser-only CSS, or unsupported utilities into React Native.
- Use React Native components and the project’s installed libraries.
- Preserve the screen’s content and interaction intent while adapting safe areas, scrolling, keyboard behavior, accessibility, and platform differences.
- Inspect existing route and component structure before choosing where converted screens belong.
- Do not create duplicate versions of existing screens or change navigation behavior without a clear requirement.

## Scope and safety

- Do not modify onboarding HTML files.
- Do not convert or replace app screens in this task; establish the design system and reusable rules first.
- Do not change business logic, routing, authentication, or unrelated configuration.
- Do not install packages or upgrade Expo, React Native, or other dependencies.
- Preserve unrelated user changes.
- If a required design decision cannot be resolved from the available references, document the uncertainty and provide a recommendation instead of silently guessing.

## Validation

After editing:

1. Show the final design token table and explain any conflicts you resolved.
2. Check that `design.md` and `tailwind.config.js` agree on token names and values.
3. Search the onboarding HTML files for remaining conflicting values and explain that they remain references, not the new app token source.
4. Check that referenced routes, fonts, assets, aliases, and scripts actually exist before describing them as available.
5. Review the diff to confirm that only the intended design guidance and token configuration changed.
6. Run only lightweight checks supported by the repository. Do not install dependencies.
7. Report changed files, checks actually run, unresolved design decisions, and any limitations honestly.

## Reusable prompt for a later conversion task

After the canonical design system is in place, use this instruction when converting a screen:

“Convert the specified onboarding HTML screen into Expo React Native within the existing project. Before editing, read `design.md`, the relevant HTML file, `tailwind.config.js`, the existing route/layout code, and applicable project guidance. Treat `design.md` as the visual authority and reuse the matching NativeWind semantic token classes. Do not copy conflicting literal colors, browser-only markup, or unsupported CSS. Preserve the HTML screen’s content and interaction intent, adapt it to accessible native controls and mobile safe areas, and follow the current Expo Router structure. Make only the changes required for this screen. Do not install packages or change unrelated routes or business logic. Validate the result with checks supported by the repository and report exactly what you changed and checked.”