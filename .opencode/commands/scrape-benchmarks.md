---
description: Updates model catalog and scrapes benchmarks, latency, and pricing from official sources (OpenRouter, Artificial Analysis, Chatbot Arena).
---

# /scrape-benchmarks

Complete model data pipeline: updates catalog from OpenRouter, then scrapes benchmarks, latency, and pricing from official sources.

> **Scope:** Full model lifecycle — catalog update + benchmark/latency/pricing scrape.

---

## Official Data Sources

| Source | Data Provided | Endpoint/URL |
|--------|--------------|--------------|
| **OpenRouter** | Model catalog, pricing, latency | `openrouter.ai/api/v1/models` |
| **Artificial Analysis** | Benchmarks, latency, pricing | `api.artificialanalysis.ai` or web scrape |
| **Chatbot Arena** | ELO ratings (arena-elo, mt-bench) | `lmsys.org`, `arena.ai` |

**NO WebSearch** — only direct fetches from these 3 official sources.

---

## How It Works

```
Coordinator
  ├── STEP 1: Update Model Catalog
  │     ├── Fetch from OpenRouter API
  │     ├── Identify last 3 releases per family
  │     ├── Mark older models as obsolete
  │     └── Update providers.ts + models.json
  │
  ├── STEP 2: Scrape Complete Model Data
  │     ├── For each active model:
  │     │   ├── Artificial Analysis → benchmarks + latency + pricing
  │     │   └── Chatbot Arena → ELO scores
  │     └── Dispatch subagents IN PARALLEL per provider
  │
  └── STEP 3: Merge & Save
        ├── Merge results (fill nulls only, never overwrite)
        ├── Write updated models.json
        ├── Run npm run build
        └── Report summary
```

---

## STEP 1: Update Model Catalog

**Goal:** Keep only last 3 models per family, mark rest as obsolete.

```
1. Fetch current models from OpenRouter API
2. Group by provider + family:
   - anthropic/claude → claude-opus-4.6, claude-sonnet-4.6, claude-opus-4.5 (keep)
   - openai/gpt-5 → gpt-5.4-pro, gpt-5.4, gpt-5.3-codex (keep)
   - google/gemini → gemini-3.1-pro, gemini-3.1-flash, gemini-3-flash (keep)
   - etc.
3. For each family, keep only 3 most recent versions
4. Mark older versions as isObsolete: true
5. Update providers.ts → models array
6. Update models.json → add new entries, update existing
```

---

## STEP 2: Scrape Model Data

**Metrics to collect per model:**

| Metric | Source | Format |
|--------|--------|--------|
| Benchmarks (all) | Artificial Analysis | numbers |
| Latency (TTFT, TPS) | Artificial Analysis | ms / tokens/sec |
| Pricing (input/output) | OpenRouter + Artificial Analysis | $/1M tokens |
| ELO ratings | Chatbot Arena | integer |

### Data Sources Detail

**Artificial Analysis** (`artificialanalysis.ai`):
- Benchmarks: swe-bench, humaneval, mmlu, gpqa, math, mt-bench, livecodebench, ifeval, simpleqa
- Latency: Time to First Token (TTFT), Tokens Per Second (TPS)
- Pricing: Input $/1M tokens, Output $/1M tokens

**Chatbot Arena** (`lmsys.org`, `arena.ai`):
- arena-elo: ELO rating (integer)
- mt-bench: Score 0-10

**OpenRouter** (`openrouter.ai`):
- Pricing fallback
- Model metadata

---

## STEP 3: Coordinator — Dispatch Subagents

**CRITICAL:** Send ALL Task tool calls in a **single message** so they run in parallel.

Each subagent receives:
- List of models to research (filtered by provider)
- Current data (to avoid overwriting)
- Source URLs to fetch
- Strict rule: NO WebSearch, only WebFetch

### Subagent Prompt Template

```
## ROLE
You are a MODEL DATA SCRAPER subagent.
Your job: fetch benchmarks, latency, and pricing for [PROVIDER_GROUP] models.

## MODELS TO RESEARCH
[List model IDs with current null fields]

## SOURCES (WebFetch only — NO WebSearch)
1. Artificial Analysis:
   - https://artificialanalysis.ai/models/[model-slug]
   - Extract: all benchmarks, latency (TTFT, TPS), pricing

2. Chatbot Arena:
   - https://lmsys.org/ or https://arena.ai/leaderboard
   - Extract: arena-elo (integer), mt-bench (0-10)

3. OpenRouter (fallback for pricing):
   - https://openrouter.ai/api/v1/models
   - Extract: pricing per 1M tokens

## RULES
- NEVER invent data — only report from named sources
- Use WebFetch directly — NO WebSearch allowed
- Fill nulls only — never overwrite existing values
- arena-elo: integer (e.g., 1423)
- mt-bench: float 0-10 (e.g., 9.1)
- latency: milliseconds
- pricing: $ per 1M tokens

## RETURN FORMAT
{
  "model-id-1": {
    "swe-bench": <number|null>,
    "humaneval": <number|null>,
    "mmlu": <number|null>,
    "gpqa": <number|null>,
    "math": <number|null>,
    "arena-elo": <integer|null>,
    "mt-bench": <float|null>,
    "livecodebench": <number|null>,
    "ifeval": <number|null>,
    "simpleqa": <number|null>,
    "latency-ttft": <ms|null>,
    "latency-tps": <tokens/sec|null>,
    "pricing-input": <$/1M|null>,
    "pricing-output": <$/1M|null>,
    "_sources": ["source-name for each non-null field"]
  }
}
```

---

## STEP 4: Merge & Write Results

```
1. Collect JSON from all subagents
2. For each model:
   For each field:
     - IF current is null AND subagent has value:
         → update to new value
         → set source in scoreSource/metadata
     - IF current is non-null:
         → keep existing (do NOT overwrite)
3. Update scrapedAt to today's date
4. Update lastUpdated at root level
```

---

## STEP 5: Verify & Report

```
1. Write to src/data/models.json
2. Run: npm run build
3. Report:
   ✅ Scrape complete — [timestamp]
   
   Catalog updated: [N] new models, [M] marked obsolete
   Models with new data: [list]
   Fields filled per model: [model-id]: [field]=[value]
   
   Build: PASSED / FAILED
```

---

## Usage

```
/scrape-benchmarks
```
Updates catalog and scrapes all models.

```
/scrape-benchmarks --provider anthropic
```
Updates catalog and scrapes only Anthropic models.

```
/scrape-benchmarks --model claude-opus-4-6
```
Scrapes a single model (catalog must be updated first).

---

## Rules

- **NO WebSearch** — only WebFetch from official sources
- Update catalog BEFORE scraping data
- Keep only last 3 models per family as active
- Never overwrite existing non-null values
- Dispatch subagents in parallel (single message)
- Always run `npm run build` after writing
- Report all sources for data written
