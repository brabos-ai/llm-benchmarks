# Plan: 0001F-layout-pricing-fixes

## Overview

Pure frontend refactor on an Astro static site. Four tightly coupled fixes: move theme/language toggles into the global layout (TopNav + BaseLayout) so they appear on every route; fix pricing/latency by removing the broken OpenRouter live fetch and reading `models.json` directly; update ModelCard to show both input and output pricing; add a site-wide OpenRouter attribution footer.

---

## Frontend

### Files to Modify

| File | Change Summary |
|------|----------------|
| `src/components/TopNav.astro` | Add toggle HTML (theme-btn + lang-btns) + sun/moon CSS |
| `src/layouts/BaseLayout.astro` | Add shared inline JS (applyTheme, applyLang, setLang, listeners) + site-wide footer |
| `src/components/HomeBehavior.astro` | Remove applyTheme, applyLang, setLang, getLangFromURL, toggle listeners, applyLang() init call |
| `src/components/ModelBehavior.astro` | Remove applyLang, setLang, getLangFromURL, toggle listeners, applyLang() init call |
| `src/pages/models/index.astro` | Remove fetchAllModels import + call + orData mapping; map pricing/latency from model fields |
| `src/components/ModelCard.astro` | Replace single priceDisplay with inputDisplay + outputDisplay; update footer to two cells |

---

### Component Contracts

#### ModelCard.astro — Props (unchanged interface, behavior changes)

| Prop | Type | Notes |
|------|------|-------|
| `pricing` | `{ prompt: number\|null; completion?: number\|null } \| null` | Already defined; `completion` used for new OUT cell |
| `latencyMs` | `number \| null` | Already defined; sourced from `model.latency_p50` directly |
| `contextLength` | `number \| null` | Already defined; sourced from `model.context_length` directly |

No prop interface changes needed — `pricing.completion` is already in the Props type but was unused.

---

### File-by-File Implementation Spec

#### 1. `src/components/TopNav.astro`

- Move HTML from `LanguageToggle.astro` (`topbar` div with `#theme-toggle-btn`, `#btn-en`, `#btn-pt`) into `top-nav-inner`, to the right of `.top-nav-links`
- Add sun/moon visibility CSS (currently missing from TopNav; was only in HomeBehavior or LanguageToggle styles):
  - `.theme-icon-sun` hidden when `[data-theme="light"]`, visible when dark
  - `.theme-icon-moon` hidden when `[data-theme="dark"]`, visible when light
- Add `lang-btn` + `theme-toggle` base styles (button resets, font, active state)
- Reference: current `LanguageToggle.astro` HTML + `HomeBehavior.astro` implicit CSS

#### 2. `src/layouts/BaseLayout.astro`

**Shared inline JS** — add second `<script is:inline define:vars={{ translations }}>` block (after anti-flash script, before `</body>`):

| Function | Logic |
|----------|-------|
| `applyTheme(theme)` | `document.documentElement.setAttribute('data-theme', theme)` + `localStorage.setItem('theme', theme)` |
| `getLangFromURL()` | `new URLSearchParams(window.location.search).get('lang') === 'pt' ? 'pt' : 'en'` |
| `applyLang(lang)` | Iterate `[data-i18n]` elements, apply `translations[lang][key]`; toggle `.active` on `#btn-pt`/`#btn-en`; set `document.documentElement.lang` |
| `setLang(lang)` | `URL.searchParams.set('lang', lang)` + `history.replaceState` + `applyLang(lang)` + `localStorage.setItem('lang', lang)` |
| `getLangInitial()` | Read URL param first; fallback to `localStorage.getItem('lang')`; fallback to `'en'` |

**Event listeners** (registered after DOM ready via inline position):
- `#theme-toggle-btn` → `click` → `toggleTheme()`
- `.lang-btn` (querySelectorAll) → `click` → `setLang(btn.dataset.lang)`

**Init calls** (at end of script):
- `applyLang(getLangInitial())`  ← lang init (URL param wins over localStorage)

**Import**: Add `import { translations } from '../data/home'` to frontmatter.

**Site-wide footer** — add before `</body>`:
```
<footer class="site-footer">
  Data sourced from <a href="https://openrouter.ai" rel="noopener noreferrer" target="_blank">OpenRouter</a>
</footer>
```
With minimal styles: centered, small text, muted color, border-top, padding.

#### 3. `src/components/HomeBehavior.astro`

**Remove** these blocks entirely (now in BaseLayout):
- `applyTheme` function + `toggleTheme` function
- `#theme-toggle-btn` event listener
- `getLangFromURL` function
- `applyLang` function
- `setLang` function
- `.lang-btn` event listeners loop
- `applyLang(getLangFromURL())` init call

**Keep** (untouched):
- `applyFilter(filter)` function
- `.pill` event listeners
- `applyFilter('all')` init call

Also keep: `define:vars={{ translations }}` removed from this component's script tag (translations no longer needed here). Update script tag to `<script is:inline>` with no `define:vars`.

#### 4. `src/components/ModelBehavior.astro`

**Remove** these blocks entirely (now in BaseLayout):
- `getLangFromURL` function
- `applyLang` function
- `setLang` function
- `.lang-btn` event listeners loop
- `applyLang(getLangFromURL())` init call at the bottom (line 315)

**Keep** (untouched):
- All score/filter/search/rank/pill/group rendering logic
- `applyFilter('all')` init call

Update `define:vars={{ benchmarksData, categoriesData, translationsData }}` — remove `translationsData` from the vars object since `applyLang` is gone. Also remove the `translationsData` frontmatter preparation block.

#### 5. `src/pages/models/index.astro`

**Remove**:
- `import { fetchAllModels } from "../../data/openrouter";` (line 10)
- `const slugs = activeModels.map((m) => m.openrouterSlug);` (line 18)
- `const openrouterMap = await fetchAllModels(slugs);` (line 19)
- `const orData = openrouterMap.get(model.openrouterSlug);` inside `.map()`

**Change** ModelCard props inside the `.map()`:

| Prop | Old value | New value |
|------|-----------|-----------|
| `isDeranked` | `orData?.is_deranked ?? false` | `(model as any).isDeranked ?? false` |
| `pricing` | `orData?.pricing ?? null` | `(model as any).pricing ?? null` |
| `latencyMs` | `orData?.stats?.p50_latency ?? null` | `(model as any).latency_p50 ?? null` |
| `contextLength` | `orData?.context_length ?? null` | `model.context_length ?? null` |

Note: `model.context_length` is directly typed in models.json; pricing/latency/isDeranked use `(model as any)` cast since they are not in the TypeScript interface for modelsData (dynamic fields from scraper).

#### 6. `src/components/ModelCard.astro`

**Replace** the `priceDisplay` block with two display vars:

| Variable | Logic |
|----------|-------|
| `inputDisplay` | If `pricing?.prompt != null`: `'$' + (prompt * 1_000_000).toFixed(prompt*1e6 >= 10 ? 0 : 2)`; else `'N/A'` |
| `outputDisplay` | If `pricing?.completion != null`: `'$' + (completion * 1_000_000).toFixed(completion*1e6 >= 10 ? 0 : 2)`; else `'N/A'` |

**Update footer HTML** — replace single "Price" `mc__foot-item` with two cells:

| Cell | Label | Value |
|------|-------|-------|
| First | `IN` | `{inputDisplay}` + `/1M` unit suffix if not N/A |
| Second | `OUT` | `{outputDisplay}` + `/1M` unit suffix if not N/A |

Existing `.mc__foot-label`, `.mc__foot-val`, `.mc__foot-unit` styles already accommodate this — no new CSS classes needed. The foot layout uses `justify-content: space-around` so 4 items (IN, OUT, Latency, Context) fit naturally.

---

### JS Logic Specification: BaseLayout Shared Script

```
Execution order (all is:inline, runs synchronously):
1. Anti-flash script (HEAD) → sets data-theme from localStorage immediately
2. Shared toggle script (BODY, before </body>) → runs after DOM is parsed

getLangInitial():
  1. Check URL param ?lang=
  2. Fallback to localStorage.getItem('lang')
  3. Fallback to 'en'

applyLang(lang):
  - Reads translations[lang] passed via define:vars
  - Updates all [data-i18n] elements innerHTML
  - Sets document.documentElement.lang attribute
  - Toggles .active class on #btn-en / #btn-pt

setLang(lang):
  - Updates URL param (history.replaceState, no page reload)
  - Saves to localStorage ('lang' key)
  - Calls applyLang(lang)

toggleTheme():
  - Reads current data-theme attribute
  - Calls applyTheme(opposite)

applyTheme(theme):
  - Sets data-theme attribute on <html>
  - Saves to localStorage ('theme' key)

Init (at script end):
  - applyLang(getLangInitial())
  - NOTE: theme init already done in HEAD anti-flash script; no duplicate call needed
```

---

### Retirement: LanguageToggle.astro

`LanguageToggle.astro` becomes unused after this change. The HTML it contained (theme-btn + lang-btns) moves into `TopNav.astro`. The component can be left in place (no new imports) — it is only imported in `src/pages/index.astro`. Remove that import from `index.astro` and the `<LanguageToggle />` usage to keep the tree clean.

Reference: `src/pages/index.astro` currently uses `<LanguageToggle />` — remove it.

---

## Implementation Order

1. **TopNav.astro** — add toggle HTML + CSS (foundation for all routes)
2. **BaseLayout.astro** — add shared JS script + translations import + site footer
3. **HomeBehavior.astro** — strip lang/theme blocks (BaseLayout now handles them)
4. **ModelBehavior.astro** — strip lang blocks (BaseLayout now handles them)
5. **models/index.astro** — remove fetchAllModels, fix prop mapping from models.json
6. **ModelCard.astro** — replace priceDisplay with inputDisplay + outputDisplay, update footer
7. **index.astro** — remove LanguageToggle import + usage (cleanup)

---

## Quick Reference

| Pattern | Where to Find |
|---------|---------------|
| Anti-flash inline script | `src/layouts/BaseLayout.astro` (existing HEAD script) |
| `define:vars` pattern | `src/components/HomeBehavior.astro` (existing usage) |
| `is:inline` script structure | `src/components/ModelBehavior.astro` |
| Toggle HTML | `src/components/LanguageToggle.astro` |
| Footer item CSS | `src/components/ModelCard.astro` `.mc__foot-item` styles |
| Translation dict shape | `src/data/home.ts` `translations` export |
| models.json pricing field | `src/data/models.json` → `pricing.prompt`, `pricing.completion` |
| models.json latency field | `src/data/models.json` → `latency_p50` (number, ms) |

---

## Spec Checklist

| # | Requirement | File(s) | Done? |
|---|-------------|---------|-------|
| AC1 | Language toggle visible and functional on all 4 routes | TopNav.astro, BaseLayout.astro | ☐ |
| AC2 | Theme toggle visible and functional on all 4 routes, correct sun/moon icon | TopNav.astro, BaseLayout.astro | ☐ |
| AC3 | Selected language persists across route navigations (localStorage fallback) | BaseLayout.astro (`setLang` saves to localStorage; `getLangInitial` reads it) | ☐ |
| AC4 | Model cards on /models show actual pricing (not N/A) for models with scraped data | models/index.astro (remove fetchAllModels), ModelCard.astro | ☐ |
| AC5 | Model cards show two price cells: IN $X and OUT $Y per 1M tokens | ModelCard.astro | ☐ |
| AC6 | Site-wide footer shows OpenRouter attribution on all pages | BaseLayout.astro | ☐ |
| AC7 | `fetchAllModels` import removed from models/index.astro | models/index.astro | ☐ |
| AC8 | No new build errors or broken pages | All files | ☐ |
| BR1 | If pricing.prompt is null → show "N/A" for IN | ModelCard.astro `inputDisplay` | ☐ |
| BR2 | If pricing.completion is null → show "N/A" for OUT | ModelCard.astro `outputDisplay` | ☐ |
| BR3 | Theme preference persists in localStorage across all routes | BaseLayout.astro (anti-flash + applyTheme) | ☐ |
| BR4 | Language preference: URL param wins over localStorage | BaseLayout.astro `getLangInitial()` | ☐ |
| SC1 | applyTheme + toggleTheme removed from HomeBehavior | HomeBehavior.astro | ☐ |
| SC2 | applyLang + setLang + getLangFromURL removed from HomeBehavior | HomeBehavior.astro | ☐ |
| SC3 | applyLang + setLang + getLangFromURL removed from ModelBehavior | ModelBehavior.astro | ☐ |
| SC4 | LanguageToggle.astro usage removed from index.astro | index.astro | ☐ |
