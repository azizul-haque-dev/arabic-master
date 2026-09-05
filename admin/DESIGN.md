# Arabic Master — Design System

> **Purpose:** This document is the single source of truth for the visual design and UX implementation of the Arabic Master web application.
>
> **Rule:** Any new UI, redesigned UI, or generated component MUST follow this document unless a specific feature requirement explicitly overrides it.

---

# 1. Product Identity

**Product:** Arabic Master

**Category:** Language Learning / EdTech

**Design Direction:** Modern Corporate EdTech

Arabic Master should feel:

- Professional
- Educational
- Calm
- Trustworthy
- Modern
- Encouraging
- Structured
- Lightweight
- Easy to use

The interface should communicate **learning, progress, mastery, and confidence** without looking like a traditional academic platform.

Avoid making the application feel:

- Overly academic
- Childish
- Gamified everywhere
- Overly decorative
- Luxury-focused
- Visually noisy
- Generic AI-generated

The product should look like a **real production SaaS/EdTech application**.

---

# 2. Core Design Principles

Every screen should follow these principles.

## 2.1 Clarity First

Users should immediately understand:

1. Where they are
2. What they are learning
3. What they can do
4. What action is most important
5. What their current progress is

Do not sacrifice usability for visual decoration.

---

## 2.2 Visual Hierarchy

Every page must have a clear hierarchy:

```text
Page
 ├── Page Header
 │    ├── Title
 │    └── Description / Actions
 │
 ├── Primary Content
 │
 ├── Secondary Content
 │
 └── Supporting Actions
```

Primary actions must visually dominate secondary actions.

---

## 2.3 Consistency

Do not introduce random:

- Colors
- Border radiuses
- Font sizes
- Shadows
- Button styles
- Spacing values
- Card styles

Use the design tokens defined in this document.

---

## 2.4 Content Over Decoration

Arabic learning content is the hero.

UI decoration must never compete with:

- Arabic words
- Sentences
- Pronunciation
- Translation
- Examples
- Exercises
- Progress information

---

# 3. Color System

## Primary Brand

```css
--color-primary: #0e7a5d;
--color-primary-dark: #0a5c46;
--color-primary-light: #98f5d1;
```

Use primary green for:

- Primary CTA
- Active navigation
- Active tabs
- Progress indicators
- Selected states
- Important links
- Brand elements

Do not use primary green as a background for large sections unless intentionally required.

---

## Secondary

```css
--color-secondary: #115e59;
--color-secondary-light: #a8ece5;
```

Use for:

- Secondary navigation
- Supporting interactive elements
- Audio controls
- Secondary highlights
- Learning modules

---

## Accent / Achievement

```css
--color-accent: #d97706;
--color-accent-light: #fef3c7;
```

Use sparingly.

Appropriate use:

- Streak
- Achievement
- Reward
- Review
- Milestones
- Special learning highlights

Never use amber as the main brand color.

---

## Neutral

```css
--color-text: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;

--color-background: #f8fafc;
--color-surface: #ffffff;

--color-border: #e2e8f0;
--color-border-strong: #cbd5e1;
```

---

## Status Colors

### Success

```css
--color-success-bg: #ecfdf5;
--color-success-text: #065f46;
```

### Info

```css
--color-info-bg: #eff6ff;
--color-info-text: #1d4ed8;
```

### Warning / Review

```css
--color-warning-bg: #fef3c7;
--color-warning-text: #92400e;
```

### Error

```css
--color-error: #ba1a1a;
--color-error-bg: #ffdad6;
--color-error-text: #93000a;
```

---

# 4. Typography

## Font Families

### Headings

```text
Plus Jakarta Sans
```

Use for:

- Page titles
- Section titles
- Headings
- Navigation headings
- Large numbers

### Body

```text
Inter
```

Use for:

- Body text
- Metadata
- Buttons
- Labels
- Forms
- English text
- Bengali UI text

---

# 5. Typography Scale

## Display

```text
Font: Plus Jakarta Sans
Size: 48px
Weight: 700
Line Height: 56px
Letter Spacing: -0.02em
```

Mobile:

```text
Size: 36px
Line Height: 44px
```

---

## Heading Large

```text
Font: Plus Jakarta Sans
Size: 32px
Weight: 700
Line Height: 40px
Letter Spacing: -0.015em
```

Mobile:

```text
Size: 26px
Line Height: 34px
```

---

## Heading Medium

```text
Size: 24px
Weight: 600
Line Height: 32px
```

---

## Heading Small

```text
Size: 20px
Weight: 600
Line Height: 28px
```

---

## Body Large

```text
Font: Inter
Size: 18px
Weight: 400
Line Height: 28px
```

---

## Body Medium

```text
Font: Inter
Size: 16px
Weight: 400
Line Height: 24px
```

---

## Body Small

```text
Font: Inter
Size: 14px
Weight: 400
Line Height: 20px
```

---

## Labels

```text
Label Large:
14px / 600 / 20px

Label Medium:
12px / 600 / 16px

Label Small:
11px / 500 / 14px
```

---

# 6. Arabic Typography

Arabic is a primary content language and must receive special treatment.

Arabic text should:

- Support RTL correctly
- Never be unnecessarily truncated
- Have sufficient line height
- Have enough space for tashkeel
- Never vertically clip
- Remain visually dominant over translations

Recommended learning-content sizing:

```text
Arabic word:
32–40px

Arabic sentence:
24–32px

Small Arabic:
20–24px
```

Arabic line-height:

```text
Minimum: 1.75
```

For important vocabulary or lesson content, prefer larger Arabic text rather than reducing it to fit.

---

# 7. Bengali Typography

Bengali text must remain readable and properly aligned.

Use:

```text
Noto Sans Bengali
```

or the project's configured Bengali-compatible font.

Recommended line-height:

```text
1.5
```

Never allow Bengali glyphs to become clipped.

---

# 8. RTL / LTR

The application supports:

```text
Arabic → RTL
English → LTR
Bengali → LTR
```

Arabic content containers should use:

```html
dir="rtl"
```

Do not manually position Arabic text using arbitrary margins.

Use logical CSS properties:

```css
margin-inline
padding-inline
inset-inline
text-align: start
```

instead of:

```css
margin-left
margin-right
padding-left
padding-right
```

when building direction-sensitive layouts.

---

# 9. Spacing System

Use an 8px base spacing system.

```text
2xs = 4px
xs  = 8px
sm  = 12px
md  = 16px
lg  = 24px
xl  = 32px
2xl = 48px
3xl = 64px
```

Use 4px only for micro adjustments.

Avoid arbitrary values such as:

```text
13px
17px
19px
27px
31px
```

unless there is a genuine visual requirement.

---

# 10. Layout

## Maximum Content Width

```text
Small: 640px
Medium: 768px
Large: 1024px
XL: 1280px
```

Most application pages should use:

```text
max-width: 1280px
```

Focused learning experiences should use:

```text
max-width: 768px
```

---

# 11. Responsive Breakpoints

## Mobile

```text
< 768px
```

Use:

```text
4-column fluid layout
16px horizontal padding
```

---

## Tablet

```text
768px – 1023px
```

Use:

```text
8-column layout
24px horizontal padding
16px grid gap
```

---

## Desktop

```text
1024px+
```

Use:

```text
12-column layout
24px grid gap
max-width: 1280px
```

---

# 12. Mobile-First Rule

Every component must be designed mobile-first.

Do not create desktop UI and simply shrink it for mobile.

On mobile:

- Stack content when appropriate
- Reduce unnecessary secondary information
- Make touch targets large
- Avoid horizontal overflow
- Convert complex tables into scrollable layouts/cards
- Keep primary actions visible
- Maintain readable Arabic text
- Avoid tiny controls

Minimum recommended touch target:

```text
44 × 44px
```

Prefer:

```text
48 × 48px
```

for important mobile actions.

---

# 13. Border Radius

Use a consistent radius system.

```text
sm      = 4px
default = 8px
md      = 12px
lg      = 16px
xl      = 24px
full    = 9999px
```

### Usage

```text
8px
→ buttons
→ inputs
→ small interactive elements

12–16px
→ cards
→ dialogs
→ lesson modules

24px
→ major learning pods
→ promotional sections

9999px
→ badges
→ pills
→ avatars
→ streak indicators
```

Do not make every component excessively rounded.

---

# 14. Elevation

Prefer borders + subtle shadows over heavy shadows.

## Level 0

Flat surface.

```text
border: 1px solid #E2E8F0
```

Use for:

- Sections
- Unselected blocks
- Background containers

---

## Level 1

Standard card:

```css
box-shadow:
  0 1px 3px rgba(15, 23, 42, 0.06),
  0 1px 2px rgba(15, 23, 42, 0.04);
```

Use for:

- Lesson cards
- Auth cards
- Vocabulary cards
- Dashboard cards

---

## Level 2

Interactive/floating:

```css
box-shadow:
  0 4px 6px rgba(15, 23, 42, 0.08),
  0 2px 4px rgba(15, 23, 42, 0.04);
```

Use for:

- Hovered cards
- Flashcards
- Floating controls

---

## Level 3

Modal:

```css
box-shadow:
  0 20px 25px rgba(15, 23, 42, 0.1),
  0 8px 10px rgba(15, 23, 42, 0.04);
```

Use for:

- Dialogs
- Popovers
- Floating language selectors

---

# 15. Buttons

## Primary

```text
Background: #0E7A5D
Text: #FFFFFF
Radius: 8px
Height: 44px
Mobile height: 48px
```

Hover:

```text
#0A5C46
```

Use only for the primary action.

Example:

```text
Start Lesson
Continue
Save
Create Lesson
Submit Answer
```

---

## Secondary

```text
Background: #FFFFFF
Border: #0E7A5D
Text: #0E7A5D
Radius: 8px
```

---

## Ghost

```text
Transparent
No border
Text: #115E59
```

Hover:

```text
#F1F5F9
```

---

## Destructive

Use the error palette.

Do not use red for normal actions.

---

# 16. Button Hierarchy

A page should normally have:

```text
1 Primary action
0–2 Secondary actions
Optional Ghost actions
```

Do not make every button primary.

Bad:

```text
[Save] [Cancel] [Delete] [Preview] [Export]
```

with all buttons visually equal.

Good:

```text
[Save] [Preview]     Cancel
```

---

# 17. Forms

Inputs:

```text
Height: 44px
Mobile: 48px
Radius: 8px
Background: #FFFFFF
Border: #CBD5E1
```

Focus:

```text
Border: #0E7A5D
Ring: rgba(14, 122, 93, 0.10)
```

Every input should have:

1. Label
2. Input
3. Optional helper text
4. Error message when necessary

Never rely only on placeholders as labels.

---

# 18. Cards

Cards should be used to create meaningful grouping.

Do not put every piece of content inside a card.

Standard card:

```text
Background: #FFFFFF
Border: 1px solid #E2E8F0
Radius: 16px
Padding desktop: 24px
Padding mobile: 16px
Elevation: 1
```

Use cards for:

- Lessons
- Vocabulary
- Progress
- Exercises
- User information
- Learning modules

Avoid nested cards unless there is a clear hierarchy.

---

# 19. Vocabulary Card

Vocabulary is one of the core experiences.

Recommended structure:

```text
┌─────────────────────────────┐
│ Category / Status           │
│                             │
│          Arabic             │
│        العَرَبِيَّة         │
│                             │
│     Pronunciation            │
│     Translation              │
│                             │
│     🔊 Listen               │
└─────────────────────────────┘
```

Arabic should be visually dominant.

Recommended:

```text
Arabic: 32–40px
Translation: 16–18px
Pronunciation: 14–16px
```

---

# 20. Quiz / Exercise UI

Learning interactions must be obvious.

A quiz screen should have:

```text
Progress
↓
Instruction
↓
Question
↓
Answer area
↓
Primary action
```

Example:

```text
Question 4 of 10

What does this Arabic word mean?

       صديق

[ Friend ]
[ Teacher ]
[ Neighbor ]
[ Student ]

             [ Check Answer ]
```

Do not overload the screen with unrelated information.

---

# 21. Progress

Progress indicators should communicate:

```text
Current position
Completion
Remaining work
Achievement
```

Use primary green for normal progress.

Use amber only for:

- Streaks
- Achievements
- Milestones

Progress must never depend only on color.

Include text or icons when necessary.

---

# 22. Status Badges

Use pill-shaped badges.

```text
Padding: 4px 12px
Radius: 9999px
```

### Completed

```text
Background: #ECFDF5
Text: #065F46
```

### In Progress

```text
Background: #EFF6FF
Text: #1D4ED8
```

### Review / Streak

```text
Background: #FEF3C7
Text: #92400E
```

---

# 23. Navigation

Navigation must remain simple.

Prioritize the user's primary tasks.

Example:

```text
Dashboard
Lessons
Vocabulary
Practice
Progress
```

Secondary items should be visually separated.

Active navigation:

```text
Primary green
```

Do not use multiple competing active colors.

---

# 24. Header

Desktop header should provide:

```text
Logo
Primary navigation
Search (if required)
Language switcher
User/account actions
```

Mobile header should prioritize:

```text
Menu
Logo
Important action
Profile
```

Avoid putting every desktop navigation item into the mobile header.

---

# 25. Language Switcher

The application supports:

```text
English
বাংলা
```

Use a compact segmented control.

Active state:

```text
#0E7A5D
```

Inactive state:

```text
transparent / neutral surface
```

The switcher must not visually compete with primary actions.

---

# 26. Audio Player

Language learning requires a simple audio experience.

Recommended floating/inline player:

```text
Play
Waveform
Progress
Speed
```

Supported speeds:

```text
0.75x
1x
1.25x
```

Primary waveform:

```text
#0E7A5D
```

Accent/scrubber:

```text
#D97706
```

The audio player should remain compact.

---

# 27. Icons

Use a single icon library consistently.

Preferred:

```text
Lucide Icons
```

Rules:

- Use icons to support meaning
- Do not use icons purely as decoration
- Keep icon sizes consistent
- Do not mix multiple icon styles

Recommended sizes:

```text
16px → metadata
20px → standard UI
24px → primary controls
```

Icon-only buttons must have accessible labels.

---

# 28. Tables

Tables are appropriate for:

- Admin interfaces
- Vocabulary management
- Lesson management
- User management
- Analytics

Desktop:

```text
Full table
```

Mobile:

```text
Horizontal scroll
```

or transform into:

```text
Stacked cards
```

Do not squeeze 8–10 columns into a tiny mobile screen.

---

# 29. Loading States

Never leave the UI blank while data is loading.

Use:

- Skeletons
- Inline spinners
- Button loading states

Skeletons should preserve the final layout dimensions.

Avoid large loading spinners for entire pages when skeleton content can be shown.

---

# 30. Empty States

An empty state should explain:

```text
What is empty
Why it is empty
What the user can do
```

Example:

```text
No lessons yet

You haven't created any lessons.

[ Create Lesson ]
```

Do not show:

```text
No data
```

without context.

---

# 31. Error States

Errors should be:

- Clear
- Specific
- Actionable
- Non-threatening

Example:

```text
Unable to load lessons

Something went wrong while loading your lessons.

[ Try Again ]
```

Do not expose technical errors to normal users.

---

# 32. Dialogs / Modals

Dialogs should:

- Have clear titles
- Have concise descriptions
- Have obvious primary action
- Support keyboard navigation
- Close predictably
- Avoid unnecessary nested dialogs

Desktop:

```text
max-width: 480–640px
```

Mobile:

```text
Near full width
16px margin
```

---

# 33. Accessibility

Accessibility is a requirement, not an optional enhancement.

All interactive elements must support:

- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Sufficient contrast
- Semantic HTML

Do not remove focus outlines without replacing them.

Icon-only buttons require:

```text
aria-label
```

Images require meaningful:

```text
alt
```

---

# 34. Animation

Animations should be subtle.

Preferred duration:

```text
150ms – 250ms
```

Use animation for:

- Hover
- Focus
- Expand/collapse
- Modal entrance
- Progress transitions
- Flashcard interactions

Avoid:

- Excessive bouncing
- Long transitions
- Decorative animation everywhere
- Animation that delays user actions

Respect:

```css
prefers-reduced-motion
```

---

# 35. Shadows & Borders

Prefer:

```text
subtle border + subtle shadow
```

over:

```text
large dark shadow
```

Do not use heavy black shadows.

The UI should feel calm and lightweight.

---

# 36. Backgrounds

Primary application background:

```text
#F8FAFC
```

Cards:

```text
#FFFFFF
```

Large sections may use subtle tonal variations.

Avoid excessive gradients.

Gradients should only be used when they have a clear product/design purpose.

---

# 37. Dashboard Design

The dashboard should answer:

```text
What should I learn next?
How much have I completed?
What did I learn recently?
How is my progress?
```

Recommended structure:

```text
Greeting
↓
Current learning / Continue
↓
Progress summary
↓
Recommended lessons
↓
Recent activity
↓
Vocabulary / Practice
```

Do not overload the dashboard with statistics.

Prioritize actionable information.

---

# 38. Learning Page

A focused learning page should minimize distractions.

Recommended:

```text
Top:
Progress + Exit

Center:
Question / Arabic content

Bottom:
Answer / Action
```

Focused learning views should generally use:

```text
max-width: 768px
```

---

# 39. Admin UI

Admin interfaces may be denser than learner-facing pages.

Admin pages can use:

- Tables
- Filters
- Search
- Pagination
- Bulk actions
- Tabs
- Dense metadata

However, they must still follow:

- Same color system
- Same typography
- Same spacing
- Same button hierarchy
- Same component language

---

# 40. Component Architecture

UI components should be reusable.

Prefer:

```text
components/
├── ui/
│   ├── button
│   ├── input
│   ├── dialog
│   ├── badge
│   ├── card
│   └── ...
│
├── shared/
│   ├── page-header
│   ├── empty-state
│   ├── loading-state
│   └── ...
│
└── features/
    ├── vocabulary/
    ├── lessons/
    ├── practice/
    └── progress/
```

Do not create a new button/card/input implementation for every feature.

---

# 41. Component Design Rules

A component should have one clear responsibility.

Avoid giant components containing:

```text
UI
API calls
business logic
form validation
data transformation
modal state
navigation
```

all in one file.

Separate concerns where appropriate.

---

# 42. Design Token Rule

Do not hardcode random values throughout components.

Bad:

```tsx
className = "bg-[#147d61] rounded-[13px] px-[19px]";
```

Prefer shared tokens / existing design-system utilities.

For Tailwind, use the project's configured theme tokens.

Example:

```tsx
className = "bg-primary rounded-md px-4";
```

---

# 43. Existing Functionality Rule

When redesigning an existing screen:

### MUST preserve

- Business logic
- API calls
- API endpoints
- Data models
- Existing functionality
- Validation rules
- Authentication behavior
- Permissions
- State management
- Routing

### MAY change

- Layout
- Styling
- Spacing
- Typography
- Visual hierarchy
- Component composition
- Responsive behavior
- UX presentation

Never rewrite working business logic just to redesign the UI.

---

# 44. Code Generation Rules

When generating a new UI:

1. Read this document first.
2. Inspect existing components before creating new ones.
3. Reuse existing components whenever possible.
4. Follow existing project architecture.
5. Follow the design tokens.
6. Build mobile-first.
7. Support Arabic RTL.
8. Maintain accessibility.
9. Avoid unnecessary dependencies.
10. Avoid duplicate components.
11. Keep components reasonably small.
12. Do not modify business logic unless explicitly requested.
13. Do not invent new colors without a strong reason.
14. Do not introduce random border radiuses.
15. Do not use excessive shadows.
16. Do not overuse cards.
17. Do not add unnecessary animations.

---

# 45. Visual Quality Checklist

Before considering a UI complete, verify:

### Layout

- [ ] Proper alignment
- [ ] Consistent spacing
- [ ] Clear hierarchy
- [ ] No unnecessary nesting
- [ ] No horizontal overflow

### Typography

- [ ] Correct font
- [ ] Correct heading hierarchy
- [ ] Readable body text
- [ ] Arabic text is properly sized
- [ ] Bengali text is readable

### Components

- [ ] Buttons have clear hierarchy
- [ ] Inputs have labels
- [ ] Cards are consistent
- [ ] Badges use correct colors
- [ ] Icons are consistent

### Responsive

- [ ] Mobile works
- [ ] Tablet works
- [ ] Desktop works
- [ ] Touch targets are large enough
- [ ] Arabic does not break on small screens

### Accessibility

- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Contrast acceptable
- [ ] Icon buttons have labels
- [ ] Semantic HTML used

### UX

- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Success feedback exists
- [ ] Primary action is obvious

---

# 46. Anti-Patterns

Never generate UI that looks like:

```text
❌ Generic AI dashboard
❌ Excessive glassmorphism
❌ Excessive gradients
❌ Huge rounded cards
❌ Excessive shadows
❌ Rainbow-colored statistics
❌ Every section inside a card
❌ Tiny Arabic text
❌ Tiny mobile buttons
❌ Desktop-only layouts
❌ Random spacing
❌ Random colors
❌ Multiple competing primary buttons
❌ Decorative icons everywhere
❌ Unnecessary animations
```

---

# 47. Final Design Goal

Arabic Master should feel like:

> **A modern, trustworthy language-learning platform designed by a professional product team.**

The visual language should combine:

```text
Modern SaaS
        +
EdTech
        +
Arabic learning
        +
Bilingual UX
        +
Calm visual hierarchy
```

The result should be **simple enough for beginners, powerful enough for serious learners, and polished enough to feel production-ready.**
