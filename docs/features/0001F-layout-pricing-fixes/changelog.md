# Changelog: 0001F

> **Date:** 2026-03-10 | **Branch:** feature/0001F-layout-pricing-fixes

## Summary

Fixed interconnected UI and data rendering issues: (1) **Global Toggles** — Moved language and theme controls from isolated routes into `TopNav.astro`, now visible everywhere. (2) **Pricing Fix** — Stopped live API fetching and now render actual pricing/latency from `models.json` (already scraped at build time). (3) **Attribution** — Added OpenRouter credit footer on all pages. (4) **Dual Pricing** — Updated `ModelCard` to show both input ($X) and output ($Y) per 1M tokens instead of single price.

---

## By Iteration

### I1 — Layout & Pricing Core (add)

**Files Modified:**

| File | Description |
|------|-------------|
| TopNav.astro | Added theme toggle + sun/moon CSS + language buttons (EN / PT-BR) |
| BaseLayout.astro | Added shared inline JS: applyTheme(), applyLang(), setLang(), toggle event listeners; passes translations via define:vars; added OpenRouter attribution footer |
| HomeBehavior.astro | Removed: applyTheme, applyLang, setLang, toggle listeners. Kept: filter logic |
| ModelBehavior.astro | Removed: language/theme functions. Kept: ranking/filter/search logic |
| pages/index.astro | Fixed language initial state, removed LanguageToggle import |
| ModelCard.astro | Replaced single price cell with dual IN/OUT display; added null guard for missing pricing |
| pages/models/index.astro | Removed fetchAllModels live-fetch; now reads pricing + latency_p50 directly from models.json |

**Implementations:**
- `TopNav::renderThemeBtn()`: sun/moon icon toggle with hover effects
- `BaseLayout::applyTheme()`: reads/writes theme to localStorage
- `BaseLayout::applyLang()`: URL param (priority) → localStorage fallback → default 'en'
- `BaseLayout::setLang()`: updates page text + URL param
- `ModelCard::inputDisplay()`: shows IN price or "N/A" if pricing.prompt null
- `ModelCard::outputDisplay()`: shows OUT price or "N/A" if pricing.completion null

### I2 — Comparison Dashboard Fix (fix)

**Files Modified:**

| File | Description |
|------|-------------|
| ComparisonDashboard.astro | Fixed model ID mismatch between providers.ts (e.g. `claude-opus-4-6`) and models.json (e.g. `anthropic-claude-opus-4.6`); now maps via openrouterSlug |

**Root Cause:** URL params from `ModelSelector` use provider IDs, but `ComparisonDashboard` was validating against models.json IDs — causing lookup to fail and empty state to display even with selected models.

**Fix:** Updated `getModelData()` to fall back to mapping via `openrouterSlug` when direct ID match fails.

---

## Core Files

### 🔴 High Priority

| File | Iteration | Description |
|------|-----------|-------------|
| TopNav.astro | I1 | Theme toggle + sun/moon + language buttons |
| BaseLayout.astro | I1 | Shared toggle logic, theme/lang persistence, OpenRouter footer |
| ModelCard.astro | I1 | Dual IN/OUT pricing display with null guards |
| pages/models/index.astro | I1 | Removed live fetch; reads pricing from models.json |
| pages/index.astro | I1 | Language initialization fixed |
| ComparisonDashboard.astro | I2 | Model ID mapping via openrouterSlug |

### 🟡 Medium Priority

| File | Iteration | Description |
|------|-----------|-------------|
| HomeBehavior.astro | I1 | Cleaned up redundant language/theme functions |
| ModelBehavior.astro | I1 | Cleaned up redundant language functions |
| ModelSelector.astro | (unchanged) | No changes needed |
| global.css | (updated) | Minor spacing/layout tweaks from build |

### 📊 Statistics

- **Total Files Changed:** 24 (6 high-priority, 4 medium, 14 low-priority/data)
- **High Priority:** 6 components/pages
- **Medium Priority:** 4 behavior/support files
- **Low Priority:** 14 data/config/temp files

---

## Acceptance Criteria Validation

- ✅ **AC01** — Language toggle visible and functional on all 4 routes
- ✅ **AC02** — Theme toggle visible and functional on all routes, correct sun/moon icons
- ✅ **AC03** — Language persists across route navigations (localStorage fallback)
- ✅ **AC04** — Model cards show actual pricing from models.json
- ✅ **AC05** — Dual price display: IN $X / OUT $Y per 1M tokens
- ✅ **AC06** — Site-wide OpenRouter attribution footer on all pages
- ✅ **AC07** — fetchAllModels import removed from models/index.astro
- ✅ **AC08** — No build errors; 186 pages compile successfully

---

## Requirements Coverage

| Total | Covered | Status |
|-------|---------|--------|
| 6 RFs + 4 RNs | 10/10 | ✅ **100%** |

**RF/RN Traceability:**
- **RF01** (global language toggle) → TopNav.astro:63-66 + BaseLayout.astro logic
- **RF02** (global theme toggle) → TopNav.astro:39-61 + BaseLayout.astro:51-60
- **RF03** (pricing from models.json) → pages/models/index.astro:61-63
- **RF04** (dual pricing IN/OUT) → ModelCard.astro:104-114, 201-207
- **RF05** (OpenRouter attribution) → BaseLayout.astro:46-48
- **RF06** (no regressions) → Build: 186 pages, 0 errors
- **RN01-04** (validation, persistence, fallbacks) → All covered per review.md audit

---

## Quality Metrics

| Metric | Value |
|--------|-------|
| Build Status | ✅ PASSED (186 pages, 0 errors) |
| Spec Compliance | ✅ 16/16 items compliant |
| Code Review Score | 9.5/10 |
| Product Validation | ✅ All RF/RN implemented |

---

## Quick Ref

```json
{
  "id": "0001F",
  "domain": "UI toggles, pricing display, attribution",
  "touched": ["src/components/", "src/pages/", "src/layouts/", "src/styles/"],
  "patterns": ["global state via localStorage", "inline JS in Astro", "fallback chains"],
  "keywords": ["language toggle", "theme persistence", "pricing from JSON", "OpenRouter credit"]
}
```

---

_Generated by /add-done · Feature complete and ready for merge_
