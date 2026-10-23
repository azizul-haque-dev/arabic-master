# Implementation Instruction: Arabic Master Learning Architecture & UI Redesign

## Role

Act as a senior mobile application architect, product designer, and experienced developer working within the existing Arabic Master application.

Your task is to inspect the existing codebase, understand its current course-based architecture, discover and follow all applicable project instructions and skills, and implement a polished, scalable learning experience based on the requirements below.

This is an existing project. Do not rebuild it from scratch, replace the current architecture unnecessarily, or introduce a parallel system when the existing implementation can be extended.

## 1. Mandatory Project Discovery Before Coding

Before making any changes:

1. Inspect the repository structure and identify the mobile framework, navigation system, state management, data models, storage layer, backend integration, and current design system.
2. Read the applicable `AGENTS.md` files, nested agent instructions, project rules, and relevant skills available in their actual locations.
3. Identify existing course, category, section, level, lesson, vocabulary, sentence, conversation, progress, subscription, and advertising implementations.
4. Review the existing screens and trace how course data flows from storage or backend to the UI.
5. Identify reusable components, existing assets, installed dependencies, and established coding conventions.
6. Check the existing project documentation and supported framework version before selecting implementation approaches.

Do not assume a particular directory structure or invent project-specific skills. Follow the actual files and instructions discovered in the repository.

**Preserve all unrelated existing functionality.** Do not overwrite working features, duplicate existing data models, or introduce unnecessary dependencies.

After discovery, determine the smallest coherent implementation plan and proceed with the implementation.

## 2. Product Requirements and Content Rules

Arabic Master contains four distinct learning products:

### A. Words — Free with advertising

- All vocabulary lessons must remain free to learn.
- Organize vocabulary into meaningful topical sections.
- Support levels such as Beginner, Elementary, Pre-Intermediate, and Intermediate when applicable.
- Divide content into manageable lessons, normally containing 10 words each.
- Include Arabic text, transliteration, Bengali meaning, and audio when supported by the existing content and application.
- Provide review and quiz functionality where existing capabilities allow.

### B. Sentences — Free with advertising

- All sentence-learning lessons must remain free.
- Organize sentences by topic, proficiency level, and lesson.
- Prefer approximately 10 sentences per lesson, adjusting when necessary to preserve meaningful learning groups.
- Support Arabic text, transliteration, Bengali translation, and audio where available.
- Do not impose a paid subscription requirement on sentence content.

### C. Conversations — Free samples plus premium content

- Organize conversations into topical sections.
- Each section may contain approximately three or four conversations.
- Provide at least one complete free conversation per section where content is available.
- Mark additional conversations as premium according to the existing entitlement architecture.
- Clearly communicate which conversations are free and which require access.
- Do not expose locked conversation content before entitlement checks when the existing backend supports protected content.

### D. Premium Curriculum — Paid structured learning

- Keep the structured, day-by-day or curriculum-based learning experience separate from the free vocabulary and sentence libraries.
- Support sequential learning plans, lessons, learning objectives, exercises, assessments, and progress tracking as appropriate to existing capabilities.
- Reuse existing purchase, subscription, entitlement, and course-management functionality.
- Do not invent payment integrations or subscription capabilities that the project does not already support.

**Non-negotiable rule:** Words and Sentences are free learning products monetized through advertising. Conversations can combine free samples and premium lessons. The structured Curriculum is a separate premium product.

## 3. Required Content Hierarchy

Design the learning experience around this conceptual hierarchy:

Learning Product → Section → Level → Lesson → Content Items

Use the following definitions:

- **Learning Product:** Words, Sentences, Conversations, or Premium Curriculum.
- **Section:** A topic or category, such as Greetings & Polite Expressions, Numbers, Food, Shopping, or Workplace Arabic.
- **Level:** A proficiency grouping, such as Beginner, Elementary, Pre-Intermediate, or Intermediate.
- **Lesson:** A manageable learning unit within a section and, where applicable, a level.
- **Content Item:** A word, sentence, conversation line, exercise, or other appropriate learning item.

This is the intended user-facing conceptual hierarchy, not a requirement to introduce five new database tables.

Inspect the current schema first. Map the hierarchy onto existing entities whenever possible. Add or change entities only when necessary, and document any required data migration.

For example:

Words
└── Greetings & Polite Expressions
    ├── Beginner
    │   ├── Part 1 — 10 expressions
    │   ├── Part 2 — 10 expressions
    │   └── Part 3 — 10 expressions
    ├── Elementary
    │   ├── Part 1
    │   └── Part 2
    └── Pre-Intermediate
        └── Part 1

Apply the same organizational principles to Sentences and Conversations, while allowing their lesson structures to differ where appropriate.

Do not create artificial levels or empty lessons merely to force every section into the same number of lessons.

## 4. User Interface and Navigation

Implement a clear, modern, mobile-first learning experience consistent with the existing application.

### Screen 1: Learning Home

Present four visually distinct learning entry points:

1. Words — Free
2. Sentences — Free
3. Conversations — Free + Premium
4. Premium Curriculum — Paid

Each entry should include a concise description, relevant icon or existing asset, and useful progress information where available.

Make the distinction between free and premium content immediately understandable.

### Screen 2: Section Explorer

When a user selects Words, Sentences, or Conversations, display the available topical sections.

Each section card should support:

- Section title
- Short description, if available
- Relevant icon or illustration
- Total lessons or learning items, when known
- Completion progress, if available
- Appropriate free or premium indicators

For example, the Words product might display:

- Greetings & Polite Expressions
- Numbers
- Food & Drinks
- Shopping
- Transportation
- Workplace Arabic

Use real project data wherever possible. Do not hardcode example sections as the production content source.

### Screen 3: Section Details and Levels

When a section is opened:

- Display its title and description.
- Show its proficiency levels in a clear hierarchy.
- Group lessons under their appropriate levels.
- Indicate the number of lessons and completion progress.
- Keep the layout compact and easy to navigate on mobile.
- Allow sections without proficiency levels to display their lessons directly.

Avoid unnecessary navigation depth. If a section contains only a few lessons, prefer a simpler layout rather than forcing users through empty intermediate screens.

### Screen 4: Lesson List

Display lessons as individual cards or list items.

Each lesson should support the following information when applicable:

- Lesson number and title
- Number of words, sentences, or conversations
- Estimated duration, if reliable data exists
- Completion state
- Current or next-available state
- Free, premium, or ad-unlock state
- Progress indicator

Use consistent visual states for available, in-progress, completed, and locked lessons.

Do not use decorative locks on content that is supposed to be freely accessible.

### Screen 5: Learning Experience

Reuse and improve the existing learning screen rather than creating a duplicate.

For vocabulary and sentences, prioritize:

- Arabic content with correct text direction
- Clear transliteration
- Bengali translation
- Audio playback when available
- Next and previous navigation
- Lesson progress
- Review and quiz actions where supported

Handle Arabic right-to-left text and Bengali typography correctly without reversing the entire application layout.

The learning interface should be readable, responsive, accessible, and optimized for small screens.

## 5. Lesson Organization and Content Integrity

Use approximately 10 items per vocabulary or sentence lesson as a default organizational rule.

However:

- Preserve the existing source content and its meanings.
- Group related expressions together where practical.
- Do not split a meaningful conversation into unrelated fragments just to reach a fixed item count.
- Allow shorter final lessons when a section has fewer remaining items.
- Avoid duplicate lessons and duplicate content items.
- Maintain stable identifiers for existing lessons wherever possible.
- Preserve existing translations, transliterations, audio references, and ordering unless a specific correction is necessary.

Do not generate fake production content to fill gaps in the dataset.

## 6. Advertising and Access Control

Integrate with the project's existing Google AdMob implementation if one exists.

### Words and Sentences

- Keep every lesson free.
- Use optional user-initiated rewarded ads to unlock lessons when appropriate.
- The first lesson in a section may be available without watching an ad.
- After the user successfully completes a rewarded ad, unlock the corresponding lesson.
- Persist successful unlocks so users do not repeatedly unlock the same lesson.
- Do not permanently block access to free learning content because an ad failed to load.
- Provide a clear retry or alternative path when no ad is available.
- Never mark an ad reward as earned merely because the ad was requested or opened.

Follow the existing ad SDK integration and official advertising policies.

### Conversations

- Allow designated free sample conversations.
- Use the existing entitlement system for premium conversations.
- Provide a clear upgrade path without interrupting free learning unnecessarily.

### Premium Curriculum

- Respect existing purchase and entitlement checks.
- Do not treat a rewarded ad as a substitute for a paid curriculum entitlement unless the existing product explicitly supports that arrangement.

### Unlock Reset Policy

Do not automatically relock lessons that users have already unlocked.

Avoid implementing a two-month or three-month reset unless the existing product requirements explicitly demand it and the reset behavior has been approved. Preserve earned progress and completed lessons.

Keep advertising, premium entitlements, and learning progress logically separate.

## 7. Data Model and Architecture

Before creating new entities, inspect and reuse the existing models.

The implementation should support these conceptual relationships:

- Learning products contain sections.
- Sections may contain proficiency levels.
- Levels contain lessons where applicable.
- Lessons reference ordered content items.
- User progress is associated with stable lesson and content identifiers.
- Ad unlocks are associated with the relevant free lesson.
- Premium entitlements are associated with protected products or lessons.

Use the existing database, API, and persistence conventions.

If the current architecture uses a course-based model, determine whether the existing course entity can represent a learning product or section before introducing additional tables or collections.

Ensure that the system can support new categories, additional languages, more lessons, and future learning products without major structural rewrites.

Avoid unnecessary database migrations. If a migration is required, make it backward-compatible when possible and document its execution requirements.

## 8. Visual Design Requirements

Create a consistent design system using the project's existing components, theme, colors, typography, spacing, and icon library.

The interface should feel like a polished language-learning application.

Prioritize:

- Clear information hierarchy
- Consistent cards and section headers
- Distinct level and lesson groupings
- Readable progress indicators
- Subtle and consistent access-status labels
- Appropriate loading, empty, and error states
- Accessible touch targets
- Responsive layouts
- Correct Arabic RTL and Bengali text rendering
- Consistent dark and light theme support if already implemented

Avoid excessive gradients, unnecessary decoration, oversized cards, and repetitive promotional banners.

Use existing assets and installed libraries wherever practical. Do not add external image dependencies or large UI packages without a clear need.

## 9. Existing Features and Backward Compatibility

Preserve the application's existing:

- Navigation and routing
- Authentication
- Backend integration
- Course management
- User progress
- Audio playback
- Advertising integration
- Premium purchases and entitlements
- Localization
- Analytics
- Theme and design system

Only change these systems where necessary to support the new learning hierarchy.

Do not remove existing features simply because they are outside the scope of this redesign.

If a required feature does not exist, implement it only when feasible within the current architecture. Clearly identify any missing backend, SDK, credentials, or configuration needed for completion.

## 10. Implementation Workflow

Follow this sequence:

1. Inspect the project instructions, skills, architecture, and existing learning features.
2. Identify the current course-based data model and reusable UI components.
3. Map the proposed hierarchy onto the existing architecture.
4. Establish the smallest coherent implementation plan.
5. Implement the new navigation and section/level/lesson organization.
6. Integrate free, rewarded-ad, and premium access states.
7. Preserve and reuse the existing learning experience.
8. Add appropriate loading, empty, error, and locked states.
9. Run the available formatter, linter, type checker, tests, and relevant build or validation commands.
10. Fix issues introduced by your changes.
11. Review the final diff for regressions, duplicated logic, accidental data loss, and unnecessary dependencies.

Do not stop after producing a plan. Implement the changes unless blocked by a genuine missing dependency or external requirement.

Do not claim that a build, test, or integration succeeded unless you actually verified it.

## 11. Acceptance Criteria

The implementation is complete when:

- [ ] The existing application architecture has been reused appropriately.
- [ ] The learning home clearly distinguishes Words, Sentences, Conversations, and Premium Curriculum.
- [ ] Users can navigate through sections, optional proficiency levels, and lessons.
- [ ] Vocabulary and sentence lessons are organized into manageable learning units.
- [ ] All Words and Sentences remain free of paid subscription requirements.
- [ ] Rewarded-ad unlocking works correctly where supported by the existing ad integration.
- [ ] Successfully unlocked lessons remain unlocked.
- [ ] Conversations support designated free samples and premium access.
- [ ] Premium Curriculum remains separate from the free learning libraries.
- [ ] Arabic RTL and Bengali text display correctly.
- [ ] Existing learning progress and important functionality are preserved.
- [ ] Relevant validation commands have been run and their results reported.
- [ ] Any remaining blockers or incomplete integrations are documented.

## 12. Final Report

After implementation, provide a concise report containing:

1. The architecture and existing project features you discovered.
2. The screens and navigation you implemented or updated.
3. Any data-model or database changes.
4. How free lessons, rewarded ads, conversations, and premium curriculum are handled.
5. The files changed and the purpose of the significant changes.
6. The validation commands executed and their actual results.
7. Any unresolved issues or manual configuration required.

Keep the implementation focused, maintainable, and consistent with the existing codebase.

**Final priority:** Deliver a working improvement to the existing Arabic Master application, not just a design proposal or a collection of mock screens.