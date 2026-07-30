---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is **contextual**. None of it fires automatically. First read the brief, then pull only what fits.
---

## 0. BRIEF INFERENCE (Read the Room Before Anything Else)

Before touching code or tweaking dials, **infer what the user actually wants**. Most LLM design output is bad because the model jumps to a default aesthetic instead of reading the room.

### 0.A Read these signals first

1. **Page kind** - landing (SaaS / consumer / agency / event), portfolio (dev / designer / creative studio), redesign (preserve vs overhaul), editorial / blog.
2. **Vibe words** the user used - "minimalist", "calm", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial", "agency-y", "glassy", "dark tech".
3. **Reference signals** - URLs they linked, screenshots they pasted, products they named, brands they're competing with.
4. **Audience** - B2B procurement panel vs. design-conscious consumer vs. recruiter scanning a portfolio. The audience picks the aesthetic, not your taste.
5. **Brand assets that already exist** - logo, color, type, photography. For redesigns, these are starting material, not optional input (see Section 11).
6. **Quiet constraints** - accessibility-first audiences, public-sector, regulated industries, trust-first commerce, kids' products. These constraints OVERRIDE aesthetic preference.

### 0.B Output a one-line "Design Read" before generating

Before any code, state in one line: **"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system or aesthetic family>."**

Example reads:
- *"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."*
- *"Reading this as: solo designer portfolio for hiring managers, with an editorial / kinetic-type language, leaning toward native CSS + scroll-driven animation + custom typography."*
- *"Reading this as: redesign of a public-sector service site, with a trust-first language, leaning toward GOV.UK Frontend or USWDS."*

### 0.C If the brief is ambiguous, ask one question, do not guess

Ask exactly **one** clarifying question - never a multi-question dump - and only when the design read genuinely diverges. Example: *"Should this feel closer to Linear-clean or Awwwards-experimental?"*

If you can confidently infer from context, **do not ask**. Just declare the design read and proceed.

### 0.D Anti-Default Discipline

Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, infinite-loop micro-animations everywhere, Inter + slate-900. These are the LLM defaults. Reach past them deliberately based on the design read.

---

## 1. THE THREE DIALS (Core Configuration)

After the design read, set three dials. Every layout, motion, and density decision below is gated by these.

- **`DESIGN_VARIANCE: 8`** - 1 = Perfect Symmetry, 10 = Artsy Chaos
- **`MOTION_INTENSITY: 6`** - 1 = Static, 10 = Cinematic / Physics
- **`VISUAL_DENSITY: 4`** - 1 = Art Gallery / Airy, 10 = Cockpit / Packed Data

**Baseline:** `8 / 6 / 4`. Use these unless the design read overrides them. Do not ask the user to edit this file - overrides happen conversationally.

### 1.A Dial Inference (design read → dial values)

| Signal | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| "minimalist / clean / calm / editorial / Linear-style" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury / brand" | 7-8 | 5-7 | 3-4 |
| "playful / wild / Dribbble / Awwwards / experimental / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio / marketing site (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / regulated / accessibility-critical" | 3-4 | 2-3 | 4-5 |
| "redesign - preserve" | match existing | +1 | match existing |
| "redesign - overhaul" | +2 | +2 | match existing |

### 1.B Use-Case Presets

| Use case | VARIANCE | MOTION | DENSITY |
|---|---|---|---|
| Landing (SaaS, mainstream) | 7 | 6 | 4 |
| Landing (Agency / creative) | 9 | 8 | 3 |
| Landing (Premium consumer) | 7 | 6 | 3 |
| Portfolio (Designer / studio) | 8 | 7 | 3 |
| Portfolio (Developer) | 6 | 5 | 4 |
| Editorial / Blog | 6 | 4 | 3 |
| Public-sector service | 3 | 2 | 5 |
| Redesign - preserve | match | match+1 | match |
| Redesign - overhaul | +2 | +2 | match |

### 1.C How the Dials Drive Output

Use these (or user-overridden values) as global variables. Cross-references throughout this document refer to these exact variable names - never invent aliases like `LAYOUT_VARIANCE` or `ANIM_LEVEL`.

---

## 2. BRIEF → DESIGN SYSTEM MAP

Once you have the design read (Section 0) and dials (Section 1), pick the right foundation. Do not invent CSS for things that have an official package. Do not pretend an aesthetic trend is an official system.

### 2.A When to reach for a real design system (use official packages)

| Brief reads as… | Reach for | Why |
|---|---|---|
| Microsoft / enterprise SaaS / dashboards | `@fluentui/react-components` or `@fluentui/web-components` | Official Fluent UI, Microsoft tokens, accessibility done |
| Google-ish UI, Material-flavored product | `@material/web` + Material 3 tokens | Official, theme-able via Material Theming |
| IBM-style B2B / enterprise analytics | `@carbon/react` + `@carbon/styles` | Official Carbon, mature data-density patterns |
| Shopify app surfaces | `polaris.js` web components / Polaris React | Required for Shopify admin UI |
| Atlassian / Jira-style product | `@atlaskit/*` + `@atlaskit/tokens` | Official Atlassian DS |
| GitHub-style devtool / community page | `@primer/css` or `@primer/react-brand` | Official Primer; Brand variant for marketing |
| Public-sector UK service | `govuk-frontend` | Legally / regulatorily expected |
| US public-sector / trust-first | `uswds` | Same |
| Fast local-business / agency MVP | Bootstrap 5.3 | Boring, fast, works |
| Modern accessible React foundation | `@radix-ui/themes` | Primitives + polished theme |
| Modern SaaS where you own the components | shadcn/ui (`npx shadcn@latest add ...`) | You own the code, easy to customise; never ship default state |
| Tailwind-based modern SaaS / AI marketing | Tailwind v4 utilities + `dark:` variant | Default for indie + small team builds |

**Honesty rule:** if the brief reads as one of the systems above, install and use the **official** package. Do not recreate its CSS by hand. Do not import a system's tokens but then override 90% of them.

**One system per project.** Do not mix Fluent React with Carbon in the same tree. Do not import shadcn/ui components into a Material 3 app.

### 2.B When the brief is an aesthetic, not a system

For these directions, there is **no single official package**. Build with native CSS + Tailwind + a maintained component library. Be honest in code comments about what is borrowed inspiration vs. official material.

| Aesthetic | Honest implementation |
|---|---|
| Glassmorphism / "frosted glass" | `backdrop-filter`, layered borders, highlight overlays. Provide solid-fill fallback for `prefers-reduced-transparency`. |
| Bento (Apple-style tile grids) | CSS Grid with mixed cell sizes. No single library owns this. |
| Brutalism | Native CSS, monospace, raw borders. No library. |
| Editorial / magazine | Serif type, asymmetric grid, generous whitespace. No library. |
| Dark tech / hacker | Mono + accent neon, terminal motifs. No library. |
| Aurora / mesh gradients | SVG or layered radial gradients. No library. |
| Kinetic typography | Native CSS animations, scroll-driven animations, GSAP for hijacks. No library. |
| **Apple Liquid Glass** | Apple documents this for Apple platforms only. **There is no official `liquid-glass.css`.** Web implementations are approximations using `backdrop-filter` + layered borders + highlights. Label clearly as approximation. |

---

## 3. DEFAULT ARCHITECTURE & CONVENTIONS

Unless the design read picks a real design system (Section 2.A), these are the defaults:

### 3.A Stack

- **Framework:** React or Next.js. Default to Server Components (RSC).
  - **RSC SAFETY:** Global state works ONLY in Client Components. In Next.js, wrap providers in a `"use client"` component.
  - **INTERACTIVITY ISOLATION:** Any component using Motion, scroll listeners, or pointer physics MUST be an isolated leaf with `'use client'` at the top. Server Components render static layouts only.
- **Styling:** **Tailwind v4** (default). Tailwind v3 only if the existing project demands it.
  - For v4: do NOT use `tailwindcss` plugin in `postcss.config.js`. Use `@tailwindcss/postcss` or the Vite plugin.
- **Animation:** **Motion** (the library formerly known as Framer Motion). Import from `motion/react` (`import { motion } from "motion/react"`). The `framer-motion` package still works as a legacy alias - prefer `motion/react` in new code.
- **Fonts:** Always use `next/font` (Next.js) or self-host with `@font-face` + `font-display: swap`. Never link Google Fonts via `<link>` in production.

### 3.B State

- Local `useState` / `useReducer` for isolated UI.
- Global state ONLY for deep prop-drilling avoidance - Zustand, Jotai, or React context.
- **NEVER** use `useState` to track continuous values driven by user input (mouse position, scroll progress, pointer physics, magnetic hover). Use Motion's `useMotionValue` / `useTransform` / `useScroll`. `useState` re-renders the React tree on every change and collapses on mobile.

### 3.C Icons

- **Allowed libraries (priority order):** `@phosphor-icons/react`, `hugeicons-react`, `@radix-ui/react-icons`, `@tabler/icons-react`.
- **Discouraged:** `lucide-react`. Acceptable only when the user explicitly asks for it or the project already depends on it.
- **NEVER hand-roll SVG icons.** If a glyph is missing, install a second library or compose from primitives - do not draw icon paths from scratch.
- **One family per project.** Do not mix Phosphor with Lucide in the same component tree.
- **Standardize `strokeWidth` globally** (e.g. `1.5` or `2.0`).

### 3.D Emoji Policy

Discouraged by default in code, markup, and visible text. Replace symbols with icon-library glyphs. **Override:** allow emojis only when the user explicitly asks for a playful / chat-style / social-native vibe - and even then use them sparingly with intent.

### 3.E Responsiveness & Layout Mechanics

- Standardize breakpoints (`sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`).
- Contain page layouts using `max-w-[1400px] mx-auto` or `max-w-7xl`.
- **Viewport Stability:** NEVER use `h-screen` for full-height Hero sections. ALWAYS use `min-h-[100dvh]` to prevent layout jumping on mobile (iOS Safari address bar).
- **Grid over Flex-Math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). ALWAYS use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).

### 3.F Dependency Verification (mandatory)

Before importing ANY 3rd-party library, check `package.json`. If the package is missing, output the install command first. **Never** assume a library exists.

---

## 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)

LLMs default to clichés. Override these defaults proactively. Each rule has a context-aware override path.

### 4.1 Typography

- **Display / Headlines:** Default `text-4xl md:text-6xl tracking-tighter leading-none`.
- **Body / Paragraphs:** Default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
- **Sans font choice:**
  - **Discouraged as default:** `Inter`. Pick `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a brand-appropriate serif first.
  - **Override:** Inter is acceptable when the user explicitly asks for a neutral / standard / Linear-style feel, or when the brief is a public-sector / accessibility-first site.
- **Pairings to know:** `Geist` + `Geist Mono`, `Satoshi` + `JetBrains Mono`, `Cabinet Grotesk` + `Inter Tight`, `GT America` + `IBM Plex Mono`.
- **SERIF DISCIPLINE (VERY DISCOURAGED AS DEFAULT):**
  - Serif is **very discouraged as the default font for any project.** "It feels creative / premium / editorial" is NOT a reason to reach for serif.
  - **Serif is only acceptable when ONE of these is explicitly true:** the brand brief literally names a serif font, OR the aesthetic family is genuinely editorial / luxury / publication / manuscript / heritage / vintage AND you can articulate why this specific serif fits this specific brand.
  - For everything else, **default sans-serif display** (Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, Inter Display, PP Neue Montreal).
  - **EMPHASIS RULE:** to emphasize a word within a headline, use **italic or bold of the SAME font**. Do NOT inject a random serif word into a sans headline.
  - **Specifically BANNED as defaults:** `Fraunces` and `Instrument_Serif`.
  - **If a serif is justified**, rotate from this pool, do NOT reuse the same serif across consecutive projects: PP Editorial New, GT Sectra Display, Cardinal Grotesque, Reckless Neue, Tiempos Headline, Recoleta, Cormorant Garamond, Playfair Display, EB Garamond, IvyPresto, Migra, Editorial Old, Saol Display, Söhne Breit Kursiv, Domaine Display, Canela, Schnyder, Tobias, NB Architekt, ITC Galliard.
- **ITALIC DESCENDER CLEARANCE (mandatory):** italic words containing descenders (`y g j p q`) need `leading-[1.1]` minimum plus `pb-1`/`mb-1` reserve, or the descender clips.

### 4.2 Color Calibration

- Max 1 accent color. Saturation < 80% by default.
- **THE LILA RULE:** the "AI Purple / Blue glow" aesthetic is discouraged as a default. Use neutral bases (Zinc / Slate / Stone) with high-contrast singular accents.
- **Override:** if the brand or brief explicitly asks for purple/violet, embrace it with intent.
- **One palette per project.**
- **COLOR CONSISTENCY LOCK (mandatory):** once an accent color is chosen, use it on the whole page.
- **PREMIUM-CONSUMER PALETTE BAN (mandatory):** for premium-consumer briefs (cookware, wellness, artisan, luxury, heritage craft), the default warm beige/cream + brass/clay/oxblood/ochre + espresso/ink text palette is BANNED. Rotate instead among: Cold Luxury (silver-grey/chrome/smoke), Forest (deep green/bone/amber), Black and Tan (off-black + warm tan), Cobalt + Cream, Terracotta + Slate, Olive + Brick + Paper, or pure monochrome + single saturated pop. Do not ship the same warm-craft palette twice in a row. Override only with explicit brand justification.

### 4.3 Layout Diversification

- **ANTI-CENTER BIAS:** centered Hero/H1 avoided when `DESIGN_VARIANCE > 4`. Prefer split-screen, left-aligned content/right asset, asymmetric white space, or scroll-pinned structures. Override: centered hero OK for editorial/manifesto/launch briefs.

### 4.4 Materiality, Shadows, Cards

- Use cards only when elevation communicates real hierarchy; otherwise group with `border-t`, `divide-y`, negative space.
- Tint shadows to background hue; no pure-black drop shadows on light backgrounds.
- For `VISUAL_DENSITY > 7`: generic card containers banned.
- **SHAPE CONSISTENCY LOCK (mandatory):** one corner-radius scale for the whole page (all-sharp, all-soft, or all-pill), or a documented mixed rule followed everywhere.

### 4.5 Interactive UI States

- Implement full cycles: loading (skeletal, shape-matched), empty states, error states, tactile `:active` feedback (`-translate-y-[1px]` or `scale-[0.98]`).
- **BUTTON CONTRAST CHECK (mandatory a11y):** every CTA text readable against its background, WCAG AA min (4.5:1 body, 3:1 large text).
- **CTA BUTTON WRAP BAN:** button text must fit one line at desktop; shorten label or widen button.
- **NO DUPLICATE CTA INTENT:** one label per intent (contact / signup / portfolio) used consistently across the page.
- **FORM CONTRAST CHECK (mandatory a11y):** inputs, placeholders, focus rings, helper/error text all pass WCAG AA against section background.

### 4.6 Data & Form Patterns

- Label above input, helper text optional but present, error text below input, `gap-2` for input blocks.
- No placeholder-as-label, ever.

### 4.7 Layout Discipline (Hard Rules)

- **Hero must fit initial viewport:** headline ≤ 2 lines desktop, subtext ≤ 20 words and ≤ 3-4 lines, CTAs visible without scroll.
- **Hero font-scale discipline:** plan font size and image size together; don't start at `text-7xl/8xl` if headline > 6 words.
- **HERO TOP PADDING CAP:** max `pt-24` at desktop.
- **HERO STACK DISCIPLINE (max 4 text elements):** eyebrow/brand-strip (pick zero or one), headline, subtext, CTAs (1 primary + max 1 secondary). Banned in hero: tiny tagline below CTAs, trust micro-strip, pricing teaser, feature bullets, social-proof avatar row - move these to sections below the hero.
- **"Trusted by" logo wall** lives under the hero, never inside it.
- **Navigation on ONE line at desktop**, height cap 80px (default 64-72px).
- **Bento grids need rhythm**, not repeated one-sided rows.
- **BENTO CELL COUNT RULE:** exactly as many cells as content items; no empty filler cells.
- **Section-Layout-Repetition Ban:** a layout family used once per page max; 8-section page needs ≥4 different families.
- **ZIGZAG ALTERNATION CAP:** max 2 consecutive image+text-split sections.
- **EYEBROW RESTRAINT (mandatory):** max 1 eyebrow (small uppercase label above a headline) per 3 sections; hero counts as 1.
- **SPLIT-HEADER BAN:** "left big headline + right small explainer paragraph" section-header pattern banned by default; stack vertically instead.
- **Bento Background Diversity:** at least 2-3 cells in any multi-cell grid need real visual variation (image, gradient, pattern), not all white-on-white text.
- **Mobile collapse explicit per section** for every multi-column layout.

### 4.8 Image & Visual Asset Strategy

Priority order: (1) image-generation tool if available - generate section-specific assets; (2) real web images (`https://picsum.photos/seed/{descriptive-seed}/{w}/{h}` or real/brand URLs); (3) last resort - clearly labeled placeholder slots and tell the user what's missing, never fill with hand-rolled SVG "fake screenshots."

Even minimalist sites need real images (at least 2-3: hero, product/lifestyle shot, supporting image).

**Real company logos:** use Simple Icons (`https://cdn.simpleicons.org/{slug}/ffffff`) or devicon for tech logos; for invented brand names, generate a simple monogram SVG rather than a plain text wordmark. Ensure logos render in both light/dark. **Logo-only rule:** no category labels printed under logos.

**Hand-rolled decorative SVGs strongly discouraged.** **Div-based fake screenshots banned** - use a real screenshot, generated image, real component preview, or skip the preview.

### 4.9 Content Density

- Default per section: headline ≤8 words + sub-paragraph ≤25 words + one visual/CTA.
- No data-dump sections (20-row tables, giant pricing matrices) - use top highlights + "view full list", marquee/carousel, or a different page.
- Lists >5 items need a real UI component (2-col grid, cards, tabs/accordion, scroll-snap pills, carousel/marquee) instead of a default bulleted `<ul>`.
- **Spec sheets:** long spec tables with a hairline under every row are the AI default for cookware/hardware/apparel briefs - banned. Use 2-col card grid, scroll-snap pills, grouped chunks, or featured-vs-rest disclosure instead.
- **COPY SELF-AUDIT (mandatory):** re-read every visible string before shipping; rewrite anything grammatically broken, unclear, or reading like forced AI wordplay.
- **Fake-precise numbers flagged** unless real, explicitly mocked, or brand-claimed.
- One copy register per page.

### 4.10 Quotes & Testimonials

Max 3 lines of quote body. No em-dash inside quote text. Attribution: name + role + (optionally) company, never name alone. Use real typographic quote marks or none.

### 4.11 Page Theme Lock (Light/Dark Consistency)

One theme for the whole page - no section flips to inverted mode mid-scroll (exception: a deliberate, single "theme switch on scroll" device). Section-level tints within the same theme family are fine.

---

## 5. CONTEXT-AWARE PROACTIVITY

Tools, not defaults - use only when the design read calls for them.

- **Liquid Glass/Glassmorphism:** appropriate for premium consumer/Apple-adjacent/luxury; inappropriate for dashboards/public-sector. Add inner border + subtle inner shadow beyond plain `backdrop-blur`; provide solid-fill fallback under `prefers-reduced-transparency`.
- **Magnetic micro-physics:** use when `MOTION_INTENSITY > 5` and brief reads premium/playful/agency; implement exclusively with Motion's `useMotionValue`/`useTransform`, never `useState`.
- **Perpetual micro-interactions** (pulse, typewriter, float, shimmer, carousel): use when `MOTION_INTENSITY > 5` and the section benefits; spring physics, no linear easing.
- **"Motion claimed, motion shown":** if `MOTION_INTENSITY > 4` the page must actually move (entry transitions, scroll-reveal, hover physics); otherwise drop the dial rather than half-build broken motion.
- **MOTION MUST BE MOTIVATED:** every animation needs a one-sentence justification (hierarchy, storytelling, feedback, state transition) - "it looked cool" is invalid.
- **MARQUEE MAX-ONE-PER-PAGE.**
- **GSAP Sticky-Stack / Horizontal-Pan patterns:** must pin correctly (`start: "top top"`, `pin: true`) - see canonical skeletons below.

### 5.A Sticky-Stack - Canonical Skeleton

```jsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">
          {card}
        </div>
      ))}
    </div>
  );
}
```

### 5.B Horizontal-Pan - Canonical Skeleton

```jsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  );
}
```

### 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative)

```jsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

### 5.D Forbidden Animation Patterns

- `window.addEventListener("scroll", ...)` banned - use Motion's `useScroll()`, GSAP ScrollTrigger, IntersectionObserver, or CSS `animation-timeline: view()`.
- Custom scroll-progress via `window.scrollY` in React state banned.
- `requestAnimationFrame` loops touching React state banned - use motion values instead.
- Use Motion's `layout`/`layoutId` for visible state changes; don't wrap static content in `layout` "for safety."
- Use `staggerChildren` (Motion) or CSS cascade for sequenced reveals.

---

## 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

- Animate only `transform` and `opacity`; use `will-change: transform` sparingly.
- **Reduced motion (mandatory):** anything above `MOTION_INTENSITY > 3` must honor `prefers-reduced-motion` and collapse to static.
- **Dark mode (mandatory for consumer-facing pages):** design both modes from the start; brief decides exact colors, but WCAG AA (AAA for body) applies in both.
- **Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1; run Lighthouse before shipping.
- Grain/noise filters only on fixed `pointer-events-none` pseudo-elements, never on scrolling containers.
- No arbitrary `z-50`/`z-10` spam - reserve z-index for systemic layers (nav, modals, overlays).

---

## 7. DIAL DEFINITIONS (Technical Reference)

**DESIGN_VARIANCE:** 1-3 predictable symmetrical grid; 4-7 offset overlaps/varied ratios; 8-10 asymmetric masonry/huge empty zones. Mobile override: collapse to single column below 768px regardless of variance level.

**MOTION_INTENSITY:** 1-3 static, hover/active only; 4-7 fluid CSS transitions + load-in cascades; 8-10 advanced choreography (scroll-triggered, parallax, GSAP ScrollTrigger) - never `window.addEventListener('scroll')`.

**VISUAL_DENSITY:** 1-3 art gallery (huge `py-32` to `py-48` gaps); 4-7 daily app (`py-16` to `py-24`); 8-10 cockpit (tight padding, no card boxes, `font-mono` for numbers).

---

## 8. DARK MODE PROTOCOL

Dual-mode by default. Pick one token strategy (Tailwind `dark:` variant, or CSS variables for component libraries) and stick to it. Brief decides exact colors; skill enforces contrast, hierarchy parity, brand fidelity, and no pure `#000000`/`#ffffff`. Respect `prefers-color-scheme` unless brand insists otherwise. Test both modes before finishing.

---

## 9. AI TELLS (Forbidden Patterns)

Avoid unless the brief explicitly asks for them:

**Visual/CSS:** no neon glows, no pure black, no oversaturated accents, no excessive gradient text, no custom cursors.

**Typography:** avoid Inter as default; no oversized screaming H1s; serif for editorial/luxury only.

**Layout:** mathematically perfect spacing; no 3-equal-column feature cards (use zig-zag/asymmetric/scroll-pinned/horizontal-scroll instead).

**Content ("Jane Doe" effect):** no generic names (John Doe), no generic avatars, no fake-perfect numbers (99.99%), no startup-slop names (Acme/Nexus/SmartFlow), no filler verbs (Elevate/Seamless/Unleash/Next-Gen/Revolutionize).

**External resources:** icons only from Phosphor/HugeIcons/Radix/Tabler (Lucide on explicit request only); no hand-rolled decorative SVGs; no div-based fake screenshots; no broken Unsplash links (use Picsum-seed instead); shadcn/ui customized, never default state.

**Production-test tells (banned outright):**
- No version labels in hero (`V0.6`, `BETA`, `EARLY ACCESS`) unless brief is an actual launch.
- No section-number eyebrows (`00/INDEX`, `001 · Capabilities`).
- Middle-dot (`·`) rationed to max 1 per line; no decorative colored status dots unless real semantic state.
- **Em-dash completely banned** (see 9.G).
- No `<br>`-broken-italicized headlines as default move; no vertical rotated text unless genuinely agency/Awwwards; no decorative crosshair/hairline grid lines.
- No div-based fake product UI in hero (#1 tell); no fake version footers in mockups.
- No "Quietly in use at/trusted by" copy; no "Field notes"-style poetic labels; no mock-humble references; no weather/locale strips unless brief is genuinely place/timezone-focused; no micro-meta-sentences under eyebrows; no generic step labels ("Stage 1/2/3").
- No pills/tags overlaid on images; no photo-credit captions as decoration; no version footers on marketing pages; no fake live-stock counters.
- No decoration text strips at hero bottom (`BRAND. MOTION. SPATIAL.`); no floating top-right corner sub-text in section headers.
- No `border-t`+`border-b` on every row of long lists; no filled-background-track scoring bars for comparisons.
- No scroll cues (`Scroll`, `↓ scroll`) - the user knows what scrolling is.

### 9.G EM-DASH BAN (the single most-violated Tell)

**Em-dash (`—`) is COMPLETELY banned** - no allowance anywhere (headlines, eyebrows, labels, pills, buttons, captions, body copy, quote attribution). En-dash (`–`) as separator also banned (use hyphen for ranges). The only permitted dash characters are the regular hyphen `-` and the math minus sign. If a single `—` or `–` appears anywhere visible, the output fails and must be rewritten. This is binary, not "use sparingly."

---

## 10. REFERENCE VOCABULARY (Pattern Names)

A vocabulary the agent should know to design with intent (implementations land in a Block Library, populated iteratively - not included in this copy):

**Hero paradigms:** Asymmetric Split Hero, Editorial Manifesto Hero, Video/Media Mask Hero, Kinetic-Type Hero, Curtain-Reveal Hero, Scroll-Pinned Hero.

**Navigation:** Dock Magnification, Magnetic Button, Gooey Menu, Dynamic Island, Contextual Radial Menu, Floating Speed Dial, Mega Menu Reveal.

**Layout/Grids:** Bento Grid, Masonry Layout, Chroma Grid, Split-Screen Scroll, Sticky-Stack Sections.

**Cards:** Parallax Tilt Card, Spotlight Border Card, Glassmorphism Panel, Holographic Foil Card, Tinder Swipe Stack, Morphing Modal.

**Scroll animations:** Sticky Scroll Stack, Horizontal Scroll Hijack, Locomotive/Sequence Scroll, Zoom Parallax, Scroll Progress Path, Liquid Swipe Transition.

**Galleries:** Dome Gallery, Coverflow Carousel, Drag-to-Pan Grid, Accordion Image Slider, Hover Image Trail, Glitch Effect Image.

**Typography:** Kinetic Marquee, Text Mask Reveal, Text Scramble Effect, Circular Text Path, Gradient Stroke Animation, Kinetic Typography Grid.

**Micro-interactions:** Particle Explosion Button, Liquid Pull-to-Refresh, Skeleton Shimmer, Directional Hover-Aware Button, Ripple Click Effect, Animated SVG Line Drawing, Mesh Gradient Background, Lens Blur Depth.

**Animation library choice:** Motion (`motion/react`) default for UI/state-change motion; GSAP+ScrollTrigger for full-page scrolltelling (isolate in leaf components); Three.js/WebGL for canvas/3D (same isolation); never mix GSAP/Three.js with Motion in the same component tree.

---

## 11. REDESIGN PROTOCOL

### 11.A Detect the Mode (first action)

- **Greenfield** - no existing site, or full overhaul approved.
- **Redesign - Preserve** - modernise without breaking the brand; audit first.
- **Redesign - Overhaul** - new visual language, preserve content/IA.

If ambiguous, ask once: *"Should this redesign preserve the existing brand, or are we starting visually from scratch?"*

### 11.B Audit Before Touching

Document before proposing changes: brand tokens (colors/type/logo/radii), information architecture, content blocks, patterns to preserve vs. retire, dial reading of the existing site, SEO baseline (rankings, meta, structured data, OG cards - the #1 redesign risk).

### 11.C Preservation Rules

Don't change IA unless asked; extract and keep existing brand colors (apply the Lila Rule override); preserve copy voice unless a rewrite is requested; honor existing accessibility wins; respect existing analytics event names.

### 11.D Modernisation Levers (priority order)

1. Typography refresh (biggest lift, lowest risk)
2. Spacing & rhythm
3. Color recalibration
4. Motion layer
5. Hero & key-section recomposition
6. Full block replacement (only if unsalvageable)

### 11.E Decision Tree

IA/content/SEO sound → targeted evolution (levers 1-4, ~70% value/~40% risk). Structural visual debt → full redesign with content preservation. Brand itself changing → greenfield.

### 11.F Never Change Silently

URL/route slugs, primary nav labels, form field names/order, brand logo/wordmark, existing legal/consent copy - all require explicit approval.

---

## 12. THE BLOCK LIBRARY

Reference Vocabulary (Section 10) names patterns; a Block Library implements them with real props/motion specs/code (populated iteratively in the source repo, not reproduced here). Frontmatter schema per block: `name`, `category`, `dial_compatibility` (variance/motion/density ranges), `when_to_use`, `not_for`, `stack`. Body sections: visual sketch, props API, code sketch, mobile fallback, motion variants per dial band, dark-mode notes, anti-patterns, references.

---

## 13. OUT OF SCOPE

Not for: dashboards/dense product UI/admin panels (use Fluent/Carbon/Atlassian/Polaris instead), data tables (TanStack Table/AG Grid), multi-step forms/wizards, code editors (Monaco/CodeMirror), native mobile (Apple HIG/Material directly), realtime collab UIs. If the brief is one of these, say so explicitly and point to the right tool.

---

## 14. FINAL PRE-FLIGHT CHECK

Run before shipping any code. If a box fails, the output is not done:

- [ ] Brief inference declared (one-liner)?
- [ ] Dial values explicit and reasoned, not silently defaulted?
- [ ] Design system chosen (Section 2) or aesthetic labeled honestly?
- [ ] Redesign mode detected and audited if applicable?
- [ ] ZERO em-dashes anywhere on the page?
- [ ] Page Theme Lock: one theme, no mid-page inversion?
- [ ] Color Consistency Lock: one accent used identically everywhere?
- [ ] Shape Consistency Lock: one corner-radius system?
- [ ] Button Contrast Check: every CTA readable (WCAG AA 4.5:1)?
- [ ] CTA Button Wrap: no label wraps to 2+ lines at desktop?
- [ ] Form Contrast Check: inputs/placeholders/labels pass WCAG AA?
- [ ] Serif discipline: not Fraunces/Instrument_Serif (or justified), different from last project?
- [ ] Premium-consumer palette check: not the default beige+brass+oxblood+espresso family?
- [ ] Italic descender clearance handled?
- [ ] Hero fits viewport (headline ≤2 lines, subtext ≤20 words/≤4 lines, CTA visible)?
- [ ] Hero top padding ≤ `pt-24`?
- [ ] Hero stack ≤4 text elements, no trust micro-strip/tagline clutter?
- [ ] Eyebrow count ≤ ceil(sectionCount/3)?
- [ ] No split-header pattern (big headline + small corner paragraph)?
- [ ] No 3+ consecutive zig-zag image+text sections?
- [ ] No duplicate CTA intent across the page?
- [ ] Logo wall = logos only, no category labels; sits under the hero?
- [ ] Bento cells have real visual variation, not all white-on-white?
- [ ] Every visible string re-read for grammar/AI-hallucination tells?
- [ ] Every animation motivated (hierarchy/storytelling/feedback/state)?
- [ ] Max one marquee per page?
- [ ] Nav on one line, height ≤80px?
- [ ] No two sections share the same layout family (≥4 families across 8 sections)?
- [ ] Bento cell count matches content exactly, no empty filler?
- [ ] Lists >5 items use a real component, not default bulleted `<ul>`?
- [ ] Real images used (gen-tool → Picsum-seed → labeled placeholder), no fake div screenshots or hand-rolled decorative SVGs?
- [ ] No pills/labels overlaid on images, no fake photo-credit captions, no version footers on marketing pages?
- [ ] No micro-meta-sentences under eyebrows, no hero-bottom decoration strips, no floating corner sub-text?
- [ ] No filled-track scoring bars; no locale/weather strips unless justified; no scroll cues; no version labels in hero unless a real launch; no section-numbering eyebrows; no decorative dots without real semantic state; no hairline-under-every-row spec tables?
- [ ] Content density sane (no data-dump tables, ≤25-word sub-paragraphs by default)?
- [ ] Quotes ≤3 lines, clean attribution, no em-dash?
- [ ] Motion claimed = motion shown; GSAP sticky-stack/horizontal-pan use correct `start:"top top"`/`pin:true`?
- [ ] No `window.addEventListener('scroll')` anywhere?
- [ ] Reduced motion respected for everything `MOTION_INTENSITY > 3`?
- [ ] Dark mode tokens defined and tested in both modes?
- [ ] Mobile collapse explicit for high-variance layouts; viewport uses `min-h-[100dvh]` not `h-screen`?
- [ ] `useEffect` animations have cleanup functions?
- [ ] Empty/loading/error states provided?
- [ ] Icons from an allowed library only, no hand-rolled SVG paths?
- [ ] Motion isolated in client-leaf components?
- [ ] No AI Tells from Section 9 present?
- [ ] Core Web Vitals plausibly met?
- [ ] One design system per project, not mixed?

If a checkbox cannot be honestly ticked, fix it before delivering.

---

## Appendix A — Install Commands per Design System

```bash
# Material Web (Material 3)
npm install @material/web

# Fluent UI React (v9)
npm install @fluentui/react-components

# Fluent UI Web Components (framework-free)
npm install @fluentui/web-components @fluentui/tokens

# IBM Carbon
npm install @carbon/react @carbon/styles

# Radix Themes
npm install @radix-ui/themes

# shadcn/ui (open code, owned components)
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Primer CSS (GitHub product/devtool UI)
npm install --save @primer/css

# Primer Brand (GitHub marketing UI)
npm install @primer/react-brand

# GOV.UK Frontend
npm install govuk-frontend

# USWDS (US Web Design System)
npm install uswds

# Atlassian Design System (Atlaskit)
yarn add @atlaskit/css-reset @atlaskit/tokens @atlaskit/button @atlaskit/badge @atlaskit/section-message @atlaskit/card

# Bootstrap 5.3
npm install bootstrap

# Shopify Polaris Web Components (Shopify apps only)
# <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
# <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
```

## Appendix B — Canonical Sources

- Material Web: https://github.com/material-components/material-web · https://material-web.dev/theming/material-theming/ · https://m3.material.io/develop/web
- Fluent UI: https://fluent2.microsoft.design/get-started/develop · https://github.com/microsoft/fluentui
- Carbon: https://carbondesignsystem.com/ · https://github.com/carbon-design-system/carbon
- Shopify Polaris: https://shopify.dev/docs/api/app-home/web-components · https://github.com/Shopify/polaris-react
- Atlassian: https://atlassian.design/get-started/develop · https://atlassian.design/tokens/design-tokens
- Primer: https://primer.style/ · https://github.com/primer/css
- GOV.UK: https://design-system.service.gov.uk/components/button/ · https://github.com/alphagov/govuk-frontend
- USWDS: https://designsystem.digital.gov/documentation/developers/ · https://github.com/uswds/uswds
- Bootstrap: https://getbootstrap.com/docs/5.3/layout/grid/
- Radix: https://www.radix-ui.com/themes/docs/components/theme
- shadcn/ui: https://ui.shadcn.com/docs
- Native CSS/W3C: MDN backdrop-filter, prefers-color-scheme, prefers-reduced-motion, CSS Grid, scroll-driven animations
- Apple Liquid Glass (Apple platforms only): Apple HIG → Materials; Apple Developer Docs → Liquid Glass / Adopting Liquid Glass; SwiftUI → Material

## Appendix C — Apple Liquid Glass: Honest Web Approximation

There is no official `liquid-glass.css` from Apple for websites — Apple's Liquid Glass is documented for native Apple-platform UI only. A web approximation (label it as such in code) can use `backdrop-filter`, layered borders, highlight overlays, and gradients:

```css
.liquid-glass-web-approx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}
.liquid-glass-web-approx::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background:
    radial-gradient(circle at 20% 0%, rgb(255 255 255 / .55), transparent 34%),
    linear-gradient(90deg, rgb(255 255 255 / .18), transparent 42%, rgb(255 255 255 / .14));
  pointer-events: none;
}
.liquid-glass-web-approx::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid rgb(255 255 255 / .14);
  pointer-events: none;
}
@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / .22),
      0 18px 60px rgb(0 0 0 / .42);
  }
}
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx {
    background: rgb(255 255 255 / .96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

Source: https://github.com/leonxlnx/taste-skill (skill `design-taste-frontend`, v2)
