# SF02: Models Grid

> **Epic:** F0001-model-comparison-dashboard
> **Branch:** feature/F0001-model-comparison-dashboard
> **Depends on:** SF01
> **Date:** 2026-03-08

---

## Objective

Implement the `/models/` page: a filterable, sortable grid of all 15 model cards — each showing provider logo, model name, top 3 benchmark scores, price badge, freshness indicator, and deprecated badge when applicable.

## Business Context

- **Why:** Users need a discovery surface to browse and rank models by use case.
- **Problem:** `/models/` is currently a placeholder.
- **Stakeholders:** End users evaluating which model to use for a specific task.

## Scope

### Included

- Replace `src/pages/models/index.astro` placeholder with full grid implementation
- `src/components/ModelCard.astro` — mini-card: provider logo, model name, top 3 scores (computed from scores + relevanceScores), price badge ($/1M tokens), "Scores from [month year]" freshness indicator, "Deprecated" badge if `is_deranked`
- `src/components/ModelBehavior.astro` (partial) — filter pills trigger model card re-sorting by weighted category score; same `is:inline define:vars` pattern as HomeBehavior
- Reuse existing `FilterPills.astro` or clone for model grid (same 5 categories: agentic, coding, reasoning, general, multiagent)
- Models sorted by default: overall score (average across all benchmarks with non-null scores)
- Bilingual labels (PT-BR/EN) for all UI text
- Dark/light theme support

### Not Included

- Individual model profile pages (SF03)
- Comparison functionality (SF04)
- Search/text filtering

## Business Rules

### Validations

- A model with all null scores renders card without score section
- Deprecated (`is_deranked`) models show badge but remain in grid
- Category filter re-ranks but never hides models (all always visible)
- Price badge: show input token price in $/1M tokens; if null → "—"

### Flows

**Happy Path:**
1. User visits `/models/`
2. Sees grid of 15 cards sorted by overall score (desc)
3. Clicks category pill (e.g. "Coding")
4. Cards re-order by coding-weighted score (using `relevanceScores` weights)
5. User clicks a model card → navigates to `/models/[slug]`

**Alternative (no scores):**
1. Model has all null scores
2. Card renders with name + provider logo + "Scores unavailable"
3. Sorted last in grid

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Filtering behavior | Re-sort, never hide | All models visible; just ranked differently |
| Default sort | Overall score average | Neutral starting point before category filter |
| Price display | Input token price, $/1M | Most comparable metric across providers |
| Freshness indicator | `scrapedAt` per model | Data already in models.json schema |

## Acceptance Criteria

- [ ] `/models/` renders grid of 15 model cards (static, Astro SSG)
- [ ] Each card shows: provider logo, model name, top 3 scores for selected category, price badge, freshness date
- [ ] Deprecated models show "Deprecated" badge
- [ ] Filter pills re-sort cards by category-weighted score (client-side)
- [ ] Default sort: overall average score descending
- [ ] Clicking card navigates to `/models/[slug]`
- [ ] Bilingual (PT-BR/EN) labels work
- [ ] Dark/light theme renders correctly

## Spec (Token-Efficient)

```
ModelCard props: { model: Model, provider: Provider, pricing: PricingData | null, isDeranked: boolean }

Score computation (client-side, for sorting):
  categoryScore(model, categoryId) =
    sum(benchmark.relevanceScores[categoryId] * model.scores[benchmark.id])
    / sum(benchmark.relevanceScores[categoryId])
    (only non-null scores included)

Top 3 scores for card display:
  Sort benchmarks by relevanceScores[selectedCategory] desc → top 3
```

## Next Steps

→ `/add-plan` for SF02 after SF01 is complete
