# Past Features Discovery: F0001-model-comparison-dashboard

> **Date:** 2026-03-08
> **Note:** F0001 is the first feature — no prior feature docs exist.

---

## Git History (Last 20 Commits)

| Hash | Theme | Relevance |
|------|-------|-----------|
| 019229f | Fix margin/padding for relevance grid | CSS grid patterns |
| b015c7c | Theme toggle + dark/light mode styles | Reusable dark/light system |
| f28f0b5 | Enhanced statistics + content references | Data display patterns |
| 3a32ca4 | Code refactoring (readability) | Clean component structure |
| f0a3089 | SummaryCard data structures + grid layout | Card + grid pattern |
| ac4b79f | Initial project setup | Base architecture |

**Key theme:** Progressive enhancement from static content → interactive filtering → theme switching.

---

## Existing Data Structures

### `src/data/home.ts`

- `categories[]` — 6 types: all, agentic, multiagent, coding, general, reasoning
- `benchmarks[]` — 14 benchmarks with `relevanceScores` per category (1-5)
- `summaryCards[]` — 5 cards grouped by use case
- `translations` — `pt` and `en` dictionaries, 100+ keys

**Key:** Benchmark relevance scoring system is already in place. Model rankings will reuse it.

---

## Existing Component Patterns

| Component | Pattern | Reuse for F0001 |
|-----------|---------|-----------------|
| FilterPills.astro | Category filter buttons, `data-filter` attrs | Clone for `/models/` |
| BenchmarkGrid.astro | Card grid with relevance scoring | Reference for ModelCard layout |
| HomeBehavior.astro | `is:inline` script, `define:vars`, DOM filtering | Pattern for ModelBehavior.astro |
| SummaryGrid.astro | Grouped card display | Reference for comparison table |

**Key patterns:** Astro static-first, `is:inline` for JS, `data-i18n` for i18n, CSS vars for theming.

---

## Existing Pages

| Page | Status |
|------|--------|
| `/` | Fully implemented |
| `/models/` | Placeholder |
| `/models/[slug]` | Placeholder (getStaticPaths stub) |
| `/compare` | Placeholder |

**Key:** Placeholder pages exist — replace content, don't restructure routes.

---

## No Prior Features

F0001 is the first feature in this project. No `iterations.jsonl`, no prior changelogs to reference.
