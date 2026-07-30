---
name: design-md
description: Read, create, validate, and apply DESIGN.md files — the google-labs-code/design.md format for describing a project's visual identity (colors, typography, spacing, component tokens) to coding agents. Use this skill whenever the user asks to build/style UI, create a design system, mentions "DESIGN.md", "design tokens", brand colors/typography for a project, or asks to lint/diff/export design tokens. Always check the project root for an existing DESIGN.md before generating any UI code, and apply its tokens exactly rather than inventing new colors/fonts.
---

# DESIGN.md

DESIGN.md is a file format (spec by Google Labs, https://github.com/google-labs-code/design.md)
that gives a coding agent a persistent, structured description of a project's
visual identity: machine-readable design tokens (YAML front matter) plus
human-readable rationale (markdown prose).

## When to use this skill

- Before writing or restyling ANY UI (React component, HTML page, CSS) in a
  project — check the project root (and common locations like `docs/`,
  `.github/`) for a `DESIGN.md` file first. If one exists, its tokens are
  normative: use its exact color/typography/spacing values instead of
  inventing your own.
- When the user asks to define, document, or formalize a brand/visual style
  for a project.
- When the user asks to validate, compare, or export design tokens.

## File anatomy

A DESIGN.md has two layers:

1. **YAML front matter** (`---` fenced) — the normative token values.
2. **Markdown body**, `##` sections in this order (any may be omitted):
   Overview → Colors → Typography → Layout → Elevation & Depth → Shapes →
   Components → Do's and Don'ts.

```yaml
---
name: Heritage
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview
...prose rationale...
```

### Token types
| Type | Format | Example |
|---|---|---|
| Color | any CSS color | `"#1A1C1E"`, `"oklch(62% 0.18 250)"` |
| Dimension | number + unit | `48px`, `-0.02em` |
| Token Reference | `{path.to.token}` | `{colors.primary}` |
| Typography | object: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, fontFeature, fontVariation | — |

Valid component properties: `backgroundColor`, `textColor`, `typography`,
`rounded`, `padding`, `size`, `height`, `width`. Variants (hover/active/pressed)
are separate component entries, e.g. `button-primary-hover`.

Full spec (if you need edge cases): https://github.com/google-labs-code/design.md/blob/main/docs/spec.md

## Workflow

### 1. Creating a new DESIGN.md
Interview the user (or infer from any existing brand assets/screenshots) for:
name/mood, primary/secondary/accent colors, fonts for headings vs body, corner
radius style, spacing scale. Write the tokens first, then the prose sections
explaining the *why* (this is what lets an agent apply the system correctly
in ambiguous cases, not just copy hex codes).

### 2. Using an existing DESIGN.md
Read it before generating UI code. Map its tokens directly onto whatever
stack you're using (CSS variables, Tailwind classes, styled-components
theme, etc.) — do not approximate or "round" colors/fonts.

### 3. Validating
The reference CLI is `@google/design.md` on npm. If Node/npm is available in
the environment:
```bash
npx @google/design.md lint DESIGN.md
```
Reports errors (`broken-ref`), warnings (`missing-primary`, `contrast-ratio`
below WCAG AA 4.5:1, `orphaned-tokens`, `missing-typography`, `section-order`,
`unknown-key`), and info (`token-summary`, `missing-sections`).

If npm/network access isn't available in the current environment, do the
equivalent checks manually:
- Every `{path.to.token}` reference resolves to a defined token
- A `colors.primary` exists
- Typography tokens exist if colors are defined
- Component `backgroundColor`/`textColor` pairs meet ~4.5:1 contrast
- No duplicate `##` section headings; sections follow canonical order

### 4. Comparing versions
```bash
npx @google/design.md diff DESIGN.md DESIGN-v2.md
```

### 5. Exporting to other tooling
```bash
npx @google/design.md export --format css-tailwind DESIGN.md > theme.css
npx @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json
npx @google/design.md export --format dtcg DESIGN.md > tokens.json
```

## Windows note
If invoking directly (not via `npx @google/design.md ...`), use the
`designmd` alias — the `.md` in the raw bin name collides with Windows'
Markdown file association:
```bash
npx -p @google/design.md designmd lint DESIGN.md
```

## Notes
- Unknown section headings and unknown color/typography token names should be
  preserved/accepted, not treated as errors — only broken token references
  and duplicate section headings are hard errors per the spec.
- This format is at `alpha` status — expect it to evolve; re-check the spec
  link above if something looks outdated.
