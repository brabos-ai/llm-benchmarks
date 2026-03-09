---
description: Coordinator that dispatches parallel subagents (one per provider group) to search for benchmark scores, then consolidates results and writes src/data/models.json.
---

# /scrape-benchmarks

Searches official sources for benchmark scores for all models in `src/data/providers.ts` and updates `src/data/models.json`. Uses a **coordinator + parallel subagents** pattern for speed.

> **Scope:** Benchmark scores only. Does NOT discover new models or update the model catalog. For catalog updates, use `fetchModelCatalog()` from `src/data/openrouter.ts`.

---

## How It Works

```
Coordinator
  ├── reads models.json + providers.ts
  ├── groups models by provider
  └── dispatches subagents IN PARALLEL (single message, multiple Task calls):
        ├── Subagent: Anthropic  → searches Claude scores  → returns JSON
        ├── Subagent: OpenAI     → searches GPT/o-series   → returns JSON
        ├── Subagent: Google     → searches Gemini scores  → returns JSON
        ├── Subagent: xAI        → searches Grok scores    → returns JSON
        └── Subagent: Others     → searches remaining      → returns JSON
  └── waits for ALL subagents to complete
  └── merges results: only fills nulls, never overwrites existing scores
  └── writes updated models.json
  └── runs npm run build to verify
  └── reports summary
```

---

## Benchmarks Reference

| Benchmark ID | Scale | Primary Sources |
|---|---|---|
| `swe-bench` | 0–100 % | swebench.com, official model cards |
| `humaneval` | 0–100 % | official model cards, Papers With Code |
| `mmlu` | 0–100 % | official model cards, Papers With Code |
| `gpqa` | 0–100 % | official model cards, published papers |
| `math` | 0–100 % | official model cards (MATH-500 or AIME pass@1) |
| `arena-elo` | integer ELO | chat.lmsys.org, arena.ai, openlm.ai/chatbot-arena |
| `mt-bench` | 0–10 float | official reports |
| `livecodebench` | 0–100 % | livecodebench.github.io/leaderboard.html |
| `ifeval` | 0–100 % | official model cards |
| `simpleqa` | 0–100 % | official model cards / papers |
| `tau-bench` | 0–100 % | tau-bench leaderboard / official reports |
| `gaia` | 0–100 % | huggingface GAIA leaderboard |
| `webarena` | 0–100 % | webarena.dev leaderboard |
| `agentbench` | 0–100 normalized | llmbench.github.io/AgentBench (original 0–10 × 10) |

**NEVER invent scores.** If not found in a verifiable source, return `null`.

---

## STEP 1: Coordinator — Read & Prepare

```
1. Read src/data/models.json → extract all model entries
2. Read src/data/providers.ts → confirm model list
3. Group models by provider:
   - anthropic: claude-opus-4, claude-sonnet-4, claude-haiku-3-5
   - openai:    gpt-4o, gpt-4-1, o3, o4-mini
   - google:    gemini-2-5-pro, gemini-2-5-flash
   - xai:       grok-3, grok-3-mini
   - others:    deepseek-v3, deepseek-r1, kimi-k2, minimax-m1
4. Note which benchmarks are already non-null per model (subagents skip those)
```

---

## STEP 2: Coordinator — Dispatch ALL Subagents in ONE Message

**CRITICAL:** Send ALL Task tool calls in a **single message** so they run in parallel.

Each subagent receives:
- The list of models it must research
- The current scores (so it knows what is already filled)
- The benchmark reference table
- The subagent prompt template below

### Direct Fetching Strategy (Before Subagent Template)

**For each benchmark, follow this order (STOP at first success):**

1. **Papers With Code** (covers humaneval, mmlu, gpqa, math, ifeval, simpleqa):
   - Fetch: `https://paperswithcode.com/leaderboards/{benchmark-name}`
   - Extract model scores from table

2. **SWE-Bench** (covers swe-bench):
   - Fetch: `https://www.swebench.com` or official repo
   - Look for model performance table

3. **Chatbot Arena** (covers arena-elo):
   - Fetch: `https://arena.ai/leaderboard` or `https://openlm.ai/chatbot-arena`
   - Extract model ELO ratings

4. **LiveCodeBench** (covers livecodebench):
   - Fetch: `https://livecodebench.github.io/leaderboard.html`
   - Extract pass rates

5. **HuggingFace** (covers gaia, webarena, agentbench):
   - Fetch official HF leaderboard URLs
   - Extract scores

6. **OpenRouter Model Cards** (general model info):
   - Use existing `fetchModelData()` or fetch model pages
   - Check if benchmarks are listed

7. **Only after all direct sources fail:**
   - Use WebSearch to locate where scores were published
   - Then WebFetch that specific page

**Performance note:** Direct fetches are 5-10x faster than WebSearch. Prioritize them.

### Subagent Prompt Template

```
## ROLE
You are a BENCHMARK SCRAPER subagent for the LLM Benchmarks project.
Your job: find official benchmark scores for [PROVIDER_GROUP] models and return structured JSON.

## MODELS TO RESEARCH
[List model IDs, names, and their current null scores]

## SOURCES TO CHECK (in order of preference)
1. **Direct Leaderboard APIs & Data (NO WebSearch needed)**
   - Papers With Code API: `https://paperswithcode.com/api/leaderboards/` (has endpoint for each benchmark)
   - Chatbot Arena (arena.ai): Direct leaderboard JSON (may require inspection)
   - LiveCodeBench: `https://livecodebench.github.io/leaderboard.html` (check HTML structure for scores)
   - SWE-bench: `https://swebench.com` (has model leaderboard with scores)
   - OpenRouter: Use existing `fetchModelData()` from `src/data/openrouter.ts` for model info
   - HuggingFace GAIA leaderboard: Direct fetch from leaderboard page
   - Tau-Bench: Direct fetch from official leaderboard

## BENCHMARK SCALE REFERENCE
[Include the full benchmark reference table]

## RULES
- NEVER invent scores — only report what you find from a named source
- For arena-elo: store as integer (e.g. 1350)
- For mt-bench: store as float 0–10 (e.g. 9.1)
- For all others: store as percentage 0–100 (e.g. 87.4)
- Do NOT re-search benchmarks that already have non-null values
- If different sources disagree: prefer the most recent official report
- **FETCH DIRECTLY first:** Use WebFetch on leaderboard URLs (papers with code, arena, swebench, livecodebench) without WebSearch
- **FALLBACK ONLY:** Use WebSearch only if direct leaderboard fetches return no data for a model
- **Examples of direct fetches:**
  - `paperswithcode.com/leaderboards/humaneval` → WebFetch this URL
  - `swebench.com` → WebFetch, extract model scores from HTML
  - `arena.ai/leaderboard` → WebFetch the leaderboard page
  - `livecodebench.github.io/leaderboard.html` → WebFetch directly

## PRIORITY REMINDER
**This is critical:** Try direct leaderboard fetches FIRST. Only use WebSearch as a last resort if direct fetches fail or return no data. Your goal is to avoid search overhead and use authoritative data directly.

## RETURN FORMAT
Return ONLY a JSON object, no other text:
{
  "model-id-1": {
    "swe-bench": <number|null>,
    "humaneval": <number|null>,
    "mmlu": <number|null>,
    "gpqa": <number|null>,
    "math": <number|null>,
    "arena-elo": <number|null>,
    "mt-bench": <number|null>,
    "livecodebench": <number|null>,
    "ifeval": <number|null>,
    "simpleqa": <number|null>,
    "tau-bench": <number|null>,
    "gaia": <number|null>,
    "webarena": <number|null>,
    "agentbench": <number|null>,
    "_sources": ["url or description of source for each non-null score"]
  },
  "model-id-2": { ... }
}
```

---

## STEP 3: Coordinator — Wait & Merge Results

After ALL subagents return:

```
1. Collect JSON from each subagent
2. For each model in results:
   For each benchmark:
     - IF current value in models.json is null AND subagent returned a number:
         → update score to the new value
         → set scoreSource to "provider-site" (or "artificialanalysis" if from that source)
     - IF current value is already non-null:
         → keep existing value (do NOT overwrite)
     - IF subagent returned null:
         → keep existing null
3. Update scrapedAt to today's date for any model that had at least one score updated
4. Update lastUpdated at root level to today's date
```

---

## STEP 4: Coordinator — Write & Verify

```
1. Write the merged result to src/data/models.json
2. Run: npm run build
3. If build fails: report the error without retrying
```

---

## STEP 5: Coordinator — Report

```
✅ Scrape complete — [timestamp]

Subagents run: [N] in parallel
Models updated: [list of IDs that had at least one new score]

Scores filled per model:
  [model-id]: [benchmark1]=[value], [benchmark2]=[value] (source: [url])
  ...

Still null after scrape:
  [model-id]: [benchmark1], [benchmark2], ...

Build: PASSED / FAILED
```

---

## Usage

```
/scrape-benchmarks
```
Scrapes all models.

```
/scrape-benchmarks --model claude-opus-4
```
Scrapes a single model (coordinator dispatches only 1 subagent).

---

## Rules

- NEVER invent scores
- NEVER overwrite existing non-null scores (only fill nulls)
- Dispatch subagents in a single message (true parallelism)
- Wait for ALL subagents before merging
- Always run `npm run build` after writing
- Report sources for every score written
