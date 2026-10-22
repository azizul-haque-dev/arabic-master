# Antigravity agent setup

This workspace includes project guidance for the Expo app. These files are repository instructions; their presence does not prove that a particular Antigravity installation has loaded them.

## Files

- `AGENTS.md` provides always-on project architecture, coding, safety, and verification guidance.
- `.agents/rules/expo.md` provides a concise always-on Expo/Router/NativeWind/Bun rule. Its `trigger: always_on` frontmatter uses the documented Antigravity rule syntax.
- `.agents/skills/expo-react-native/SKILL.md` is for SDK compatibility, routing, native features, platform behavior, and Expo troubleshooting.
- `.agents/skills/ui-ux-mobile/SKILL.md` is for mobile screens, interactions, accessibility, and responsive behavior.
- `.agents/skills/api-integration/SKILL.md` is for API contracts, TanStack Query, errors, authentication, and persistence.
- `.agents/skills/debugging-testing/SKILL.md` is for bug diagnosis and repository-supported checks.

## Expected layout

```text
AGENTS.md
README-AGENT-SETUP.md
.agents/
  rules/
    expo.md
  skills/
    api-integration/SKILL.md
    debugging-testing/SKILL.md
    expo-react-native/SKILL.md
    ui-ux-mobile/SKILL.md
```

## Discovery and invocation

Antigravity's official documentation describes root `AGENTS.md` as plain Markdown guidance scoped to its directory, rule files as immediate `.md` children under `.agents/rules/`, and workspace skills as `.agents/skills/<skill-folder>/SKILL.md`. Skills are surfaced by their frontmatter `name` and `description`, then loaded when relevant; Antigravity app documentation also describes manual invocation using `/<skill-name>`. This workspace follows those paths and formats.

After adding or changing files, reopen or refresh the workspace if Antigravity does not update its discovered customizations. In Antigravity IDE, inspect the Customizations menu in the agent side panel for active skills/rules. Try relevant tasks or invoke `/expo-react-native`, `/ui-ux-mobile`, `/api-integration`, and `/debugging-testing` to check whether the skills are available. Exact UI labels and refresh behavior can vary by Antigravity version; verify in the installed client. Do not infer activation just from file existence.

## Keeping guidance current

When routing, SDK versions, dependencies, scripts, configuration, or folder structure change, inspect the actual repository first. Update `AGENTS.md`, the focused rule, relevant skills, and this guide together when their facts or discovery instructions become stale. Keep unverifiable conventions explicitly marked as unknown until code establishes them.

## Known limitations

- This setup was checked against the official Antigravity Rules and Agent Skills documentation, not against a running Antigravity client. Live discovery and slash-command availability still need confirmation in that client.
- Project facts can change; package files and installed versions remain authoritative.
- At setup, no tests or test directories were found. `reset-project` points to a missing `scripts/reset-project.js`, and the availability of lint support must be checked before relying on it.
