# Task: Layout & Pricing Fixes

> **Branch:** feature/0001F-layout-pricing-fixes
> **Feature:** 0001F
> **Date:** 2026-03-09

---

## Objective

Fix four interconnected issues: global language/theme toggles, pricing/latency data not rendering, OpenRouter attribution, and pricing display showing both input + output per million tokens.

## Business Context

- **Why:** Core UI controls (language, theme) are isolated to one route, breaking the experience. Scraped pricing/latency data exists but is not surfacing in the UI due to a data-mapping bug. OpenRouter provides the metrics and should be credited.
- **Problem:** (1) `LanguageToggle.astro` + `HomeBehavior.astro` are only mounted on `/` — other routes have no theme/language control. (2) `models/index.astro` re-fetches OpenRouter at build time using the wrong endpoint (passes `openrouterSlug` as `permaslug`), ignoring the already-scraped `pricing` and `latency_p50` fields in `models.json`. (3) No OpenRouter credit anywhere. (4) `ModelCard.astro` only shows input price; completion price is unused.
- **Stakeholders:** All site visitors on `/models`, `/models/[slug]`, `/compare`.

## Scope

### Included
- Move language + theme toggles into `TopNav.astro` (visible on all routes)
- Move shared toggle JS logic to `BaseLayout.astro` so it runs on every page
- Fix pricing/latency rendering: read from `model.pricing` and `model.latency_p50` in `models.json` instead of live-fetching at build time
- Add OpenRouter attribution badge/note near pricing data (ModelCard footer or near pricing labels)
- Update `ModelCard.astro` to display both input and output price per million tokens

### Not Included
- Changes to the scraping pipeline (`scripts/`)
- Changes to `models.json` data shape
- i18n for the attribution text (English-only)
- `/compare` page pricing display (out of scope for now)

## Business Rules

### Validations
- If `pricing.prompt` is null → show "N/A" for input
- If `pricing.completion` is null → show "N/A" for output
- Theme preference persists in `localStorage` across all routes (already in `BaseLayout`)
- Language preference persists via `?lang=` URL param across all routes

### Flows

**Happy Path (language toggle):**
1. User on any route sees language toggle in TopNav
2. User clicks PT-BR → page text switches language, URL param `?lang=pt` set
3. User navigates to another route → URL param carries over (native browser behavior)

**Happy Path (pricing display):**
1. Model card footer shows: `IN $3.00 / OUT $15.00` (per 1M)
2. Data sourced from `models.json` `pricing.prompt` / `pricing.completion` fields

**Error:**
1. `pricing` is null → show "N/A" with no unit suffix

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Toggle placement | Move into TopNav | TopNav is rendered by BaseLayout on every route |
| Language JS | Extract to BaseLayout inline script | Avoids duplicating applyLang/setLang across HomeBehavior, ModelBehavior |
| Lang persistence | localStorage + URL param (param wins) | URL param alone resets on navigation; localStorage makes it sticky |
| Pricing data source | Use models.json fields directly; remove fetchAllModels entirely | Scraped data is already there; live-fetch uses wrong slug variant causing silent null |
| Attribution placement | Site-wide footer on all pages | Better visibility for credit than per-card note |
| Price format | Two cells: IN $X / OUT $Y per 1M | Clearest semantics; replaces single "Price" cell in ModelCard footer |
| Theme icon CSS | Include in TopNav styles (shared) | sun/moon visibility CSS must travel with the HTML, not stay in HomeBehavior |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Null pricing | `pricing` field null or partial | Show "N/A" for each missing side independently |
| No latency | `latency_p50` missing | Show "N/A", same as current |
| Route without lang param | User lands on `/models` directly | Read localStorage or default to "en" (fallback chain) |
| Compare page | No ModelCard instances | Attribution not shown there; acceptable for now |

## Acceptance Criteria

- [ ] Language toggle visible and functional on `/`, `/models`, `/models/[slug]`, `/compare`
- [ ] Theme toggle visible and functional on all routes, with correct sun/moon icon visibility
- [ ] Selected language persists across route navigations (localStorage fallback)
- [ ] Model cards on `/models` show actual pricing (not N/A) for models with scraped data
- [ ] Model cards show two price cells: **IN $X** and **OUT $Y** per 1M tokens
- [ ] Site-wide footer shows OpenRouter attribution on all pages
- [ ] `fetchAllModels` import removed from `models/index.astro`
- [ ] No new build errors or broken pages

## Spec (Token-Efficient)

```
LAYOUT:
  TopNav.astro           ← add toggle HTML (theme-btn + lang-btns) + sun/moon CSS
  BaseLayout.astro       ← add shared inline JS: applyTheme, applyLang(localStorage+URL),
                            setLang, toggle event listeners; pass translations via define:vars
  LanguageToggle.astro   ← can be retired (logic absorbed into TopNav + BaseLayout)
  HomeBehavior.astro     ← strip: applyTheme, applyLang, setLang, getLangFromURL,
                            toggle event listeners, initial applyLang() call
                            keep: applyFilter, pill/filter listeners, initial applyFilter()
  ModelBehavior.astro    ← strip: applyLang, setLang, getLangFromURL,
                            toggle event listeners, initial applyLang() call
                            keep: all ranking/filter/search logic

DATA:
  models/index.astro     ← remove fetchAllModels import + call
                         ← pricing={model.pricing ?? null}
                         ← latencyMs={(model as any).latency_p50 ?? null}
                         ← contextLength={model.context_length ?? null} (already scraped)

UI:
  ModelCard.astro        ← replace priceDisplay with inputDisplay + outputDisplay
                         ← footer: two cells "IN" + "OUT" replacing single "Price"
  BaseLayout.astro       ← add site-wide footer with OpenRouter attribution link
```

## Next Steps

Ready for `/add-dev` — implementation is straightforward (no new deps, no new routes, pure refactor + display fixes).
