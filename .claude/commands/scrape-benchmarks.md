---
description: >-
  Use when updating LLM benchmark data, syncing model catalogs, or scraping pricing/latency metrics from OpenRouter, Artificial Analysis, or Chatbot Arena.
metadata:
  triggers: benchmarks, pricing, latency, openrouter, artificial-analysis, chatbot-arena, model-catalog, scrape, throughput, arena-elo
---

# /scrape-benchmarks

**🤖 AGENT FALLBACK MODE** - Use only when Node Scraper fails.

**For routine operations, use Node Scraper:**
```bash
npm run scrape              # Full scrape
npm run scrape:missing      # Fill missing data only
npm run scrape:report       # Check coverage
```

**This agent command is for:**
- Edge cases that broke the Node scraper
- Manual validation of suspicious data
- New providers not in the hardcoded list
- When automated scraping returns incomplete results

Complete pipeline: updates model catalog from OpenRouter, then scrapes benchmarks, latency, and pricing from official sources.

---

## When to Use

**Use Node Scraper first (automated):**
- `npm run scrape` - Full scrape of all providers
- `npm run scrape:missing` - Fill only missing data
- `npm run scrape:report` - Check data coverage

**Use Agent ONLY when:**
- Node scraper fails or returns incomplete data
- Manual validation needed for suspicious values
- New provider not in the hardcoded list
- Edge cases requiring human judgment
- API changes broke the Node scraper

**NOT for:**
- Routine data updates (use Node scraper)
- Bulk operations (use Node scraper)

---

## Quick Reference

### Node Scraper Commands (Use First!)

| Command | Purpose |
|---------|---------|
| `npm run scrape` | Full scrape of all providers |
| `npm run scrape:missing` | Fill only missing data |
| `npm run scrape:report` | Check data coverage |
| `npm run scrape:provider anthropic` | Single provider |
| `npm run scrape:model claude-opus-4` | Single model |
| `npm run normalize` | Add `scores` sub-object from flat fields (run after manual agent edits) |

### Agent Commands (Fallback Only)

| Flag | Purpose |
|------|---------|
| `--provider [name]` | Manual scrape single provider |
| `--model [id]` | Manual scrape single model |
| `--validate` | Validate suspicious data |
| `--missing-only` | Only scrape missing data |

---

## Data Sources

| Source | Data | Endpoint | Docs |
|--------|------|----------|------|
| **OpenRouter Author** | All models per provider + pricing + specs | `/frontend/author-models?authorSlug={provider}` | [docs/openrouter.md](/docs/openrouter.md) |
| **OpenRouter Benchmarks** | All benchmark scores | `/internal/v1/artificial-analysis-benchmarks?slug={slug}` | [docs/openrouter.md](/docs/openrouter.md) |
| **OpenRouter Stats** | Latency (p50-p99), Throughput (p50-p99) | `/frontend/stats/endpoint?permaslug={slug}&variant=standard` | [docs/openrouter.md](/docs/openrouter.md) |
| **Chatbot Arena** | ELO ratings, MT-bench | HuggingFace CSV | - |

**NO WebSearch** — only WebFetch from official sources.

**Providers:** anthropic, openai, google, x-ai, deepseek, moonshotai, minimax, meta-llama, mistralai

---

## Recommended Workflow

### 1. Try Node Scraper First

```bash
# Check current status
npm run scrape:report

# Full scrape (all providers)
npm run scrape

# If missing data detected:
npm run scrape:missing

# Verify again
npm run scrape:report
```

### 2. Use Agent Only If Needed

**When to escalate to agent:**
- `npm run scrape:report` shows missing data after Node scraper
- Specific model needs manual verification
- New provider not in hardcoded list
- Suspicious/outlier values detected

**Agent workflow:**
```
STEP 1: Check scrape-report.json
  └── Read report to see what's missing

STEP 2: Manual validation (if needed)
  └── Verify specific models with issues
  └── Cross-reference with official sources

STEP 3: Targeted scrape
  └── Only fetch missing data for specific models
  └── Use WebFetch + grep extraction

STEP 4: Merge & validate
  └── Update models.json
  └── Run npm run build
  └── Generate validation report
```

---

## How Node Scraper Works

**Location:** `scripts/scrape-openrouter.js`

**What it does:**
1. Fetches all providers in parallel (`/author-models`)
2. Extracts pricing, specs, metadata
3. Groups by family → keeps last 3 versions
4. Fetches benchmarks (`/artificial-analysis-benchmarks`)
5. Fetches stats (`/stats/endpoint`)
6. Merges with existing data (fill nulls only)
7. Generates report (`src/data/scrape-report.json`)

**Advantages over agent:**
- ✓ 10-50x faster (native JSON parsing)
- ✓ Handles large responses easily
- ✓ Consistent results
- ✓ No token costs
- ✓ Runs in CI/CD

**Generated files:**
- `src/data/models.json` - Updated model data
- `src/data/scrape-report.json` - Coverage report

---

## STEP 1: Fetch Author Models (PARALLEL per Provider)

**Goal:** Fetch all models from each provider with pricing and specs.

**Dispatch ALL provider calls in single message for parallelism.**

**Providers:** anthropic, openai, google, x-ai, deepseek, moonshotai, minimax, meta-llama, mistralai

**Endpoint:** `https://openrouter.ai/api/frontend/author-models?authorSlug={provider}`

### Extract These Fields (grep examples):

```bash
# Save author models
curl -s "https://openrouter.ai/api/frontend/author-models?authorSlug=anthropic" > /tmp/author-anthropic.json

# Model identification
cat /tmp/author-anthropic.json | grep -o '"slug":"[^"]*"'              # e.g., "anthropic/claude-sonnet-4.6"
cat /tmp/author-anthropic.json | grep -o '"name":"[^"]*"'               # e.g., "Anthropic: Claude Sonnet 4.6"
cat /tmp/author-anthropic.json | grep -o '"created_at":"[^"]*"'         # e.g., "2026-02-17T15:43:10Z"

# Specs
cat /tmp/author-anthropic.json | grep -o '"context_length":[0-9]*'       # e.g., 1000000
cat /tmp/author-anthropic.json | grep -o '"max_completion_tokens":[0-9]*'# e.g., 128000
cat /tmp/author-anthropic.json | grep -o '"supports_reasoning":[a-z]*'   # e.g., true/false
cat /tmp/author-anthropic.json | grep -o '"input_modalities":\[[^]]*\]'  # e.g., ["text","image"]
cat /tmp/author-anthropic.json | grep -o '"output_modalities":\[[^]]*\]'# e.g., ["text"]

# Pricing
cat /tmp/author-anthropic.json | grep -o '"prompt":"[0-9.e-]*"'         # e.g., "0.000003"
cat /tmp/author-anthropic.json | grep -o '"completion":"[0-9.e-]*"'     # e.g., "0.000015"
cat /tmp/author-anthropic.json | grep -o '"input_cache_read":"[0-9.e-]*"'# e.g., "0.0000003"
cat /tmp/author-anthropic.json | grep -o '"input_cache_write":"[0-9.e-]*"'# e.g., "0.00000375"

# Permaslug (for stats endpoint)
cat /tmp/author-anthropic.json | grep -o '"permaslug":"[^"]*"'          # e.g., "anthropic/claude-4.6-sonnet-20260217"

# Clean up
rm /tmp/author-anthropic.json
```

### Process:

1. **Dispatch** WebFetch for ALL providers in parallel
2. **Save** each response to `/tmp/author-{provider}.json`
3. **Extract** all fields above using grep
4. **Group** by provider/family (e.g., anthropic/claude-opus, anthropic/claude-sonnet)
5. **Sort** by `created_at` (newest first)
6. **Keep** only 3 most recent per family as active
7. **Mark** older as `isObsolete: true`
8. **Cache** in memory: pricing, specs, permaslugs for merge later
9. **Delete** temp files

**Note:** Pricing extracted here = NO NEED to fetch from stats endpoint! Only latency/throughput needed from stats.

---

## STEP 2: API Response Caching

**CRITICAL:** API responses are LARGE. NEVER load full JSON into context.

### Process

1. **WebFetch** API endpoint
2. **Save** raw response to temp file
3. **Extract** data using grep/jq/regex
4. **Parse** extracted snippet only
5. **Delete** temp file

### Stats Extraction (/api/frontend/stats/endpoint)

**Extract only needed fields:**

```bash
# Save response
curl -s "https://openrouter.ai/api/frontend/stats/endpoint?permaslug=anthropic/claude-opus-4&variant=standard" > /tmp/or-stats.json

# Extract pricing (prompt, completion, input_cache_read, internal_reasoning)
cat /tmp/or-stats.json | grep -o '"prompt":"[0-9.e-]*"'
cat /tmp/or-stats.json | grep -o '"completion":"[0-9.e-]*"'
cat /tmp/or-stats.json | grep -o '"input_cache_read":"[0-9.e-]*"'
cat /tmp/or-stats.json | grep -o '"internal_reasoning":"[0-9.e-]*"'

# Extract latency percentiles (p50-p99)
cat /tmp/or-stats.json | grep -o '"p[0-9]*_latency":[0-9.]*'

# Extract throughput percentiles (p50-p99)
cat /tmp/or-stats.json | grep -o '"p[0-9]*_throughput":[0-9.]*'

# Clean up
rm /tmp/or-stats.json
```

**Tools:** `grep`, `jq` (if available), `regex`, `head/tail`

### Pro Tips

- Use `grep -o` to output only matching parts
- Regex `[^"]*` matches anything except quotes
- Pricing already extracted from `/author-models` — only latency/throughput needed from stats

---

## STEP 3: Scrape Benchmarks + Stats (PARALLEL)

**Dispatch ALL subagents in single message for parallelism.**

### OpenRouter Benchmarks + Stats

**Pricing already extracted from `/author-models` in STEP 1!**

| Data | Endpoint | Extraction |
|------|----------|------------|
| **Benchmarks** | `/internal/v1/artificial-analysis-benchmarks?slug={slug}` | grep evaluations object |
| **Latency** | `/frontend/stats/endpoint?permaslug={permaslug}` | grep p[0-9]*_latency |
| **Throughput** | `/frontend/stats/endpoint?permaslug={permaslug}` | grep p[0-9]*_throughput |

### Available Benchmarks (from OpenRouter)

From `/internal/v1/artificial-analysis-benchmarks`:
- `artificial_analysis_intelligence_index` - Intelligence score
- `artificial_analysis_coding_index` - Coding capability
- `artificial_analysis_agentic_index` - Agentic performance
- `gdpval_aa` - GDP validation
- `aa_omniscience_accuracy` - Accuracy
- `aa_omniscience_non_hallucination_rate` - Non-hallucination rate
- `lcr` - LCR benchmark
- `ifbench` - IFBench score
- `gpqa` - GPQA benchmark
- `hle` - HLE score
- `scicode` - SciCode benchmark
- `terminalbench_hard` - TerminalBench (hard)
- `critpt` - CritPT score

**Note:** Each model may have MULTIPLE entries (e.g., adaptive vs non-reasoning variants). Use the first/default variant or extract all with `grep -o '"permaslug":"{slug}"[^}]*"evaluations":{[^}]*}'`

### Chatbot Arena

`arena-elo` e `mt-bench` foram **removidos** do modelo de dados — não são coletados.

---

## STEP 4: Subagent Prompt Template

**Coordinator extracted pricing/specs from `/author-models` in STEP 1!**

**Subagents ONLY fetch:** benchmarks + latency/throughput.

```markdown
## ROLE
Model data scraper for [PROVIDER_GROUP] models.

## MODELS TO RESEARCH
[List model IDs with null fields]

## API RESPONSE CACHING (CRITICAL)
1. WebFetch endpoint → Save to temp file
2. Use grep/jq/regex to extract ONLY needed fields
3. NEVER load full JSON into context
4. Delete temp file after extraction

## WHAT TO FETCH

### 1. OpenRouter Benchmarks (NEW!)
**Endpoint:** `https://openrouter.ai/api/internal/v1/artificial-analysis-benchmarks?slug={slug}`

**Extract with grep:**
```bash
# Save
curl -s "https://openrouter.ai/api/internal/v1/artificial-analysis-benchmarks?slug={slug}" > /tmp/bench-{slug}.json

# Extract all benchmark scores (may have multiple variants)
grep -o '"evaluations":{[^}]*"artificial_analysis_intelligence_index":[0-9.]*[^}]*}' /tmp/bench-{slug}.json

# Or extract specific fields
grep -o '"artificial_analysis_intelligence_index":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"artificial_analysis_coding_index":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"artificial_analysis_agentic_index":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"gpqa":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"hle":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"scicode":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"ifbench":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"lcr":[0-9.]*' /tmp/bench-{slug}.json
grep -o '"terminalbench_hard":[0-9.]*' /tmp/bench-{slug}.json

# Note: Each model may have MULTIPLE variants (adaptive vs non-reasoning)
# Extract first occurrence or all with: grep -o '"aa_slug":"[^"]*"[^}]*"evaluations"'

# Clean up
rm /tmp/bench-{slug}.json
```

### 2. OpenRouter Stats (latency/throughput ONLY)
**Endpoint:** `https://openrouter.ai/api/frontend/stats/endpoint?permaslug={permaslug}&variant=standard`

**Note:** Pricing already provided by coordinator from `/author-models`!

**Extract with grep:**
```bash
# Save
curl -s "https://openrouter.ai/api/frontend/stats/endpoint?permaslug={permaslug}&variant=standard" > /tmp/stats-{slug}.json

# Latency percentiles (p50-p99)
grep -o '"p[0-9]*_latency":[0-9.]*' /tmp/stats-{slug}.json

# Throughput percentiles (p50-p99)
grep -o '"p[0-9]*_throughput":[0-9.]*' /tmp/stats-{slug}.json

# Clean up
rm /tmp/stats-{slug}.json
```

## RULES
- **ALWAYS cache API responses** — save to file, grep extract, delete after
- **Pricing + specs already provided by coordinator** from `/author-models` — DO NOT fetch from stats endpoint
- NEVER invent data — only from named sources
- WebFetch only — NO WebSearch
- Fill nulls only — never overwrite existing values
- latency: milliseconds
- pricing: $ per token (convert from per-1M if needed)
- throughput: tokens per second
- Benchmarks may have multiple variants per model — extract all or use first

## RETURN FORMAT
{
  "model-id-1": {
    "intelligence_index": <number|null>,
    "coding_index": <number|null>,
    "agentic_index": <number|null>,
    "gpqa": <number|null>,
    "hle": <number|null>,
    "scicode": <number|null>,
    "ifbench": <number|null>,
    "lcr": <number|null>,
    "terminalbench_hard": <number|null>,
    "gdpval": <number|null>,
    "omniscience_accuracy": <number|null>,
    "omniscience_non_hallucination": <number|null>,
    "critpt": <number|null>,
    "latency-p50": <ms|null>,
    "latency-p75": <ms|null>,
    "latency-p90": <ms|null>,
    "latency-p95": <ms|null>,
    "latency-p99": <ms|null>,
    "throughput-p50": <tokens/sec|null>,
    "throughput-p75": <tokens/sec|null>,
    "throughput-p90": <tokens/sec|null>,
    "throughput-p95": <tokens/sec|null>,
    "throughput-p99": <tokens/sec|null>,
    "pricing": {
      "prompt": <$/token|null>,
      "completion": <$/token|null>,
      "input_cache_read": <$/token|null>,
      "internal_reasoning": <$/token|null>
    },
    "_sources": ["source-name for each non-null field"]
  }
}
```

---

## STEP 5: Merge & Write

**Data sources to merge:**
1. **STEP 1** (`/author-models`): pricing, specs, context, modalities
2. **STEP 2** (subagents): benchmarks, latency, throughput
3. ~~Chatbot Arena~~ — removido

```
1. Collect data from all sources
2. For each model:
   For each field:
     IF current is null AND new value exists:
       → update to new value
       → set source in _sources
     IF current is non-null:
       → keep existing (do NOT overwrite)
3. Update scrapedAt per model
4. Update lastUpdated at root level
5. Write to src/data/models.json
6. Run: npm run normalize   ← generates model.scores + openrouterSlug from flat fields
7. Run: npm run build
8. Delete all temp cache files
```

---

## STEP 6: Verify & Report

```
✅ Scrape complete — [timestamp]

Catalog updated: [N] new models, [M] marked obsolete
Models with new data: [list]
Fields filled per model: [model-id]: [field]=[value]

Build: PASSED / FAILED
```

---

## Rules

- **ALWAYS cache API responses** — save to temp, grep extract, delete after
- **NO WebSearch** — only WebFetch from official sources
- Update catalog BEFORE scraping data
- Keep only last 3 models per family active
- Never overwrite existing non-null values
- Dispatch subagents in parallel (single message)
- Always run `npm run build` after writing
- Report all sources for data written
