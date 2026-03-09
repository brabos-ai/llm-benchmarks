# Plan: F0002 — Smart Model Catalog & Scraping Update

Plano técnico para implementação do pipeline de scraping inteligente de modelos LLM com extensão de schema, family grouping na UI, e comando Claude Code `/scrape-models`. Baseado em about.md e discovery.md.

---

## Spec

### Context

```json
{
  "feature": "F0002-model-scraping-update",
  "branch": "feature/F0002-model-scraping-update",
  "stack": "Astro 5 + TypeScript (static site)",
  "estimate": "L",
  "backward_compat": "F0001 components must keep working — no breaking changes to providers.ts public API",
  "build_cmd": "npm run build",
  "patterns": ["ECharts via window.echarts CDN", "is:inline scripts", "getStaticPaths() for model pages", "dark/light theme via data-theme + MutationObserver"]
}
```

### Files

```json
{
  "create": [
    "src/data/model-families.json",
    ".codeadd/commands/scrape-models.md"
  ],
  "modify": [
    "src/data/providers.ts",
    "src/data/models.json",
    "src/data/openrouter.ts",
    "src/pages/models/index.astro",
    "src/components/ModelCard.astro",
    "src/components/ModelProfile.astro"
  ]
}
```

### Tasks

```json
[
  {"id":1,"task":"Extend ProviderModel interface in providers.ts (family, version, variant, isObsolete)","estimate":"S","deps":[]},
  {"id":2,"task":"Update all 15 models in providers.ts with new fields populated","estimate":"S","deps":[1]},
  {"id":3,"task":"Extend models.json schema (add family, version, variant, isObsolete, scoreSource fields to all 15 entries)","estimate":"S","deps":[1]},
  {"id":4,"task":"Create src/data/model-families.json (whitelist + aliases for all 7 providers)","estimate":"S","deps":[]},
  {"id":5,"task":"Add fetchModelCatalog() to openrouter.ts","estimate":"M","deps":[4]},
  {"id":6,"task":"Create .codeadd/commands/scrape-models.md (Claude Code slash command)","estimate":"M","deps":[4,5]},
  {"id":7,"task":"Update models/index.astro (filter isObsolete + family grouping UI)","estimate":"M","deps":[2,3]},
  {"id":8,"task":"Update ModelCard.astro (version/variant display + obsolete badge)","estimate":"S","deps":[2,3]},
  {"id":9,"task":"Update ModelProfile.astro (Part of family X section with sibling links)","estimate":"M","deps":[2,3]}
]
```

---

## Tasks Detalhadas

### Task 1: Extend ProviderModel interface in providers.ts

**Estimate:** S
**Files:** `src/data/providers.ts`
**Deps:** None

**What to change:**

The current `ProviderModel` interface has only `id`, `name`, `openrouterSlug`. Extend it to:

```typescript
export interface ProviderModel {
  id: string;
  name: string;
  openrouterSlug: string;
  family: string;         // e.g. "claude-opus", "gpt-4", "gemini", "grok", "deepseek-v", "deepseek-r", "kimi", "minimax-m"
  version: string;        // e.g. "4", "4.1", "2.5", "3", "3", "1", "k2", "1"
  variant?: string;       // e.g. "pro", "flash", "mini", "sonnet", "haiku", "opus" — undefined if model IS the family root
  isObsolete?: boolean;   // true = archived, not shown in grid/selector, direct URL still works
}
```

**Checklist:**
- [ ] Add `family: string` (required)
- [ ] Add `version: string` (required)
- [ ] Add `variant?: string` (optional)
- [ ] Add `isObsolete?: boolean` (optional, default false)
- [ ] No changes to `Provider` interface, `ProviderId` type, `allModels`, `getProvider()` — keep backward compat
- [ ] TypeScript must compile without errors after change

---

### Task 2: Update all 15 models in providers.ts with new fields

**Estimate:** S
**Files:** `src/data/providers.ts`
**Deps:** Task 1

**All 15 models with new field values:**

**Anthropic (family = claude-variant convention):**
```typescript
// claude-opus-4: family is the tier, version is the number
{ id: "claude-opus-4",    name: "Claude Opus 4",    openrouterSlug: "anthropic/claude-opus-4",   family: "claude", version: "4",   variant: "opus"   }
{ id: "claude-sonnet-4",  name: "Claude Sonnet 4",  openrouterSlug: "anthropic/claude-sonnet-4", family: "claude", version: "4",   variant: "sonnet" }
{ id: "claude-haiku-3-5", name: "Claude Haiku 3.5", openrouterSlug: "anthropic/claude-haiku-3.5",family: "claude", version: "3.5", variant: "haiku"  }
```

**OpenAI:**
```typescript
{ id: "gpt-4o",   name: "GPT-4o",   openrouterSlug: "openai/gpt-4o",  family: "gpt-4",  version: "4o",  variant: undefined }
{ id: "gpt-4-1",  name: "GPT-4.1",  openrouterSlug: "openai/gpt-4.1", family: "gpt-4",  version: "4.1", variant: undefined }
{ id: "o3",       name: "o3",       openrouterSlug: "openai/o3",       family: "openai-o",version: "3",  variant: undefined }
{ id: "o4-mini",  name: "o4-mini",  openrouterSlug: "openai/o4-mini",  family: "openai-o",version: "4",  variant: "mini"    }
```

**Google:**
```typescript
{ id: "gemini-2-5-pro",   name: "Gemini 2.5 Pro",   openrouterSlug: "google/gemini-2.5-pro",   family: "gemini", version: "2.5", variant: "pro"   }
{ id: "gemini-2-5-flash", name: "Gemini 2.5 Flash",  openrouterSlug: "google/gemini-2.5-flash", family: "gemini", version: "2.5", variant: "flash" }
```

**xAI:**
```typescript
{ id: "grok-3",      name: "Grok 3",      openrouterSlug: "x-ai/grok-3",      family: "grok", version: "3", variant: undefined }
{ id: "grok-3-mini", name: "Grok 3 Mini", openrouterSlug: "x-ai/grok-3-mini", family: "grok", version: "3", variant: "mini"    }
```

**DeepSeek:**
```typescript
{ id: "deepseek-v3", name: "DeepSeek V3", openrouterSlug: "deepseek/deepseek-chat", family: "deepseek-v", version: "3", variant: undefined }
{ id: "deepseek-r1", name: "DeepSeek R1", openrouterSlug: "deepseek/deepseek-r1",   family: "deepseek-r", version: "1", variant: undefined }
```

**Moonshot AI:**
```typescript
{ id: "kimi-k2", name: "Kimi K2", openrouterSlug: "moonshotai/kimi-k2", family: "kimi", version: "k2", variant: undefined }
```

**MiniMax:**
```typescript
{ id: "minimax-m1", name: "MiniMax-M1", openrouterSlug: "minimax/minimax-m1", family: "minimax-m", version: "1", variant: undefined }
```

**Checklist:**
- [ ] All 15 models have `family` and `version` populated
- [ ] Variants are only set where a model is a named flavor of a version (not the root)
- [ ] `isObsolete` NOT set on any current model (all are active)
- [ ] `allModels` export still works (it's a flatMap — no changes needed)
- [ ] Build passes (`npm run build`) after changes

---

### Task 3: Extend models.json schema

**Estimate:** S
**Files:** `src/data/models.json`
**Deps:** Task 1

**New ModelEntry shape (extend each of the 15 entries):**

Add these fields to each entry in `"models"` array:
```json
{
  "family": "...",
  "version": "...",
  "variant": "...",       // omit key if no variant
  "isObsolete": false,    // always explicit false for current models
  "scoreSource": {
    "swe-bench": null,
    "humaneval": null,
    "mmlu": null,
    "gpqa": null,
    "math": null,
    "arena-elo": null,
    "mt-bench": null,
    "livecodebench": null,
    "ifeval": null,
    "simpleqa": null,
    "tau-bench": null,
    "gaia": null,
    "webarena": null,
    "agentbench": null
  }
}
```

**Family/version/variant mapping per model** (same as Task 2 above, must be consistent):

| id | family | version | variant |
|----|--------|---------|---------|
| claude-opus-4 | claude | 4 | opus |
| claude-sonnet-4 | claude | 4 | sonnet |
| claude-haiku-3-5 | claude | 3.5 | haiku |
| gpt-4o | gpt-4 | 4o | (omit) |
| gpt-4-1 | gpt-4 | 4.1 | (omit) |
| o3 | openai-o | 3 | (omit) |
| o4-mini | openai-o | 4 | mini |
| gemini-2-5-pro | gemini | 2.5 | pro |
| gemini-2-5-flash | gemini | 2.5 | flash |
| grok-3 | grok | 3 | (omit) |
| grok-3-mini | grok | 3 | mini |
| deepseek-v3 | deepseek-v | 3 | (omit) |
| deepseek-r1 | deepseek-r | 1 | (omit) |
| kimi-k2 | kimi | k2 | (omit) |
| minimax-m1 | minimax-m | 1 | (omit) |

**scoreSource values:** `"artificialanalysis"`, `"provider-site"`, `"manual"`, or `null`. For existing non-null scores, set to `"manual"` (they were manually entered). For null scores, set to `null`.

For `claude-haiku-3-5` (which has real scores: swe-bench, humaneval, mmlu, gpqa, math, arena-elo, ifeval), set those to `"manual"`.

**Checklist:**
- [ ] `family`, `version` added to all 15 entries
- [ ] `variant` added where applicable (omit key where no variant)
- [ ] `isObsolete: false` explicit on all 15
- [ ] `scoreSource` object added to all 15 with appropriate `"manual"` or `null` values
- [ ] Existing `scores` values NOT changed
- [ ] JSON remains valid (no trailing commas, proper types)
- [ ] `lastUpdated` field updated to `"2026-03-09"`

---

### Task 4: Create src/data/model-families.json

**Estimate:** S
**Files:** `src/data/model-families.json` (CREATE)
**Deps:** None

**Full structure to create:**

```json
{
  "_comment": "Whitelist of monitored model families. Agent uses this to filter OpenRouter catalog. aliases map known variant slugs to canonical family metadata.",
  "families": {
    "claude": {
      "provider": "anthropic",
      "displayName": "Claude",
      "openrouterPrefix": "anthropic/claude",
      "variants": ["opus", "sonnet", "haiku"],
      "maxVersions": 3
    },
    "gpt-4": {
      "provider": "openai",
      "displayName": "GPT-4",
      "openrouterPrefix": "openai/gpt-4",
      "variants": ["default", "o", "turbo", "mini"],
      "maxVersions": 3
    },
    "openai-o": {
      "provider": "openai",
      "displayName": "OpenAI o-series",
      "openrouterPrefix": "openai/o",
      "variants": ["default", "mini", "pro"],
      "maxVersions": 3
    },
    "gemini": {
      "provider": "google",
      "displayName": "Gemini",
      "openrouterPrefix": "google/gemini",
      "variants": ["pro", "flash", "flash-thinking", "ultra"],
      "maxVersions": 3
    },
    "grok": {
      "provider": "xai",
      "displayName": "Grok",
      "openrouterPrefix": "x-ai/grok",
      "variants": ["default", "mini", "vision"],
      "maxVersions": 3
    },
    "deepseek-v": {
      "provider": "deepseek",
      "displayName": "DeepSeek V (Chat)",
      "openrouterPrefix": "deepseek/deepseek-chat",
      "variants": ["default"],
      "maxVersions": 3
    },
    "deepseek-r": {
      "provider": "deepseek",
      "displayName": "DeepSeek R (Reasoner)",
      "openrouterPrefix": "deepseek/deepseek-r1",
      "variants": ["default", "lite", "zero"],
      "maxVersions": 3
    },
    "kimi": {
      "provider": "moonshotai",
      "displayName": "Kimi",
      "openrouterPrefix": "moonshotai/kimi",
      "variants": ["default"],
      "maxVersions": 3
    },
    "minimax-m": {
      "provider": "minimax",
      "displayName": "MiniMax-M",
      "openrouterPrefix": "minimax/minimax-m",
      "variants": ["default"],
      "maxVersions": 3
    }
  },
  "aliases": {
    "openai/gpt-4-turbo": { "family": "gpt-4", "version": "turbo", "variant": "default" },
    "openai/gpt-4-turbo-preview": { "family": "gpt-4", "version": "turbo", "variant": "preview" },
    "openai/gpt-4-1106-preview": { "family": "gpt-4", "version": "turbo", "variant": "default" },
    "openai/gpt-4-vision-preview": { "family": "gpt-4", "version": "vision", "variant": "default" },
    "deepseek/deepseek-chat": { "family": "deepseek-v", "version": "3", "variant": "default" },
    "deepseek/deepseek-v3": { "family": "deepseek-v", "version": "3", "variant": "default" },
    "deepseek/deepseek-r1-zero": { "family": "deepseek-r", "version": "1", "variant": "zero" },
    "deepseek/deepseek-r1-lite-preview": { "family": "deepseek-r", "version": "1", "variant": "lite" },
    "x-ai/grok-2": { "family": "grok", "version": "2", "variant": "default" },
    "x-ai/grok-2-mini": { "family": "grok", "version": "2", "variant": "mini" }
  }
}
```

**Checklist:**
- [ ] `families` object has all 9 family keys matching the values used in Tasks 2 and 3
- [ ] Each family has `provider`, `displayName`, `openrouterPrefix`, `variants`, `maxVersions`
- [ ] `maxVersions: 3` on all families (business rule from about.md)
- [ ] `aliases` cover known slug ambiguities per about.md edge cases
- [ ] File is valid JSON

---

### Task 5: Add fetchModelCatalog() to openrouter.ts

**Estimate:** M
**Files:** `src/data/openrouter.ts`
**Deps:** Task 4

**Do NOT modify** existing `fetchModelData()` or `fetchAllModels()` — append only.

**New interfaces and function to add:**

```typescript
// ─── Catalog fetch ──────────────────────────────────────────────────────────

export interface OpenRouterCatalogModel {
  id: string;           // e.g. "anthropic/claude-opus-4"
  name: string;         // display name from OpenRouter
  context_length: number | null;
  pricing: {
    prompt: string;     // OpenRouter returns strings for catalog pricing
    completion: string;
  } | null;
  architecture?: {
    modality?: string;
  };
}

export interface OpenRouterCatalogResponse {
  data: OpenRouterCatalogModel[];
}

/**
 * Fetches the full model catalog from OpenRouter's public API.
 * Filters to only models whose slug starts with one of the provided prefixes.
 * Returns empty array on any error — never throws.
 *
 * Used by the /scrape-models agent command (not at build time).
 *
 * @param prefixWhitelist - Array of slug prefixes to include (e.g. ["anthropic/", "openai/"])
 *   Pass empty array or omit to return all models.
 */
export async function fetchModelCatalog(prefixWhitelist: string[] = []): Promise<OpenRouterCatalogModel[]> {
  try {
    const url = "https://openrouter.ai/api/v1/models";
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) return [];

    const raw = await res.json() as OpenRouterCatalogResponse;

    if (!Array.isArray(raw.data)) return [];

    const models = raw.data as OpenRouterCatalogModel[];

    if (prefixWhitelist.length === 0) return models;

    return models.filter((m) =>
      prefixWhitelist.some((prefix) => m.id.startsWith(prefix))
    );
  } catch {
    return [];
  }
}
```

**Checklist:**
- [ ] New interfaces `OpenRouterCatalogModel` and `OpenRouterCatalogResponse` added
- [ ] `fetchModelCatalog()` exported and documented
- [ ] Existing `fetchModelData()` and `fetchAllModels()` NOT touched
- [ ] Function returns `[]` on any error (graceful degradation, same pattern as existing code)
- [ ] `prefixWhitelist` parameter works correctly: empty = all, non-empty = filtered
- [ ] TypeScript compiles without errors

---

### Task 6: Create .codeadd/commands/scrape-models.md

**Estimate:** M
**Files:** `.codeadd/commands/scrape-models.md` (CREATE)
**Deps:** Tasks 4, 5

This is a Claude Code slash command (markdown file describing agent behavior). It is NOT a Node.js script. When a dev runs `/scrape-models` in Claude Code, the agent reads this file and follows the instructions.

**Full content to create:**

````markdown
---
description: Scrapes model catalog from OpenRouter + benchmark scores from ArtificialAnalysis.ai (primary) and provider websites (fallback). Updates src/data/models.json and src/data/providers.ts with new models, archives obsolete ones, and populates benchmark scores.
---

# /scrape-models

Updates the model catalog with real data from OpenRouter and benchmark scoring APIs.

## What this command does

1. Fetches model catalog from OpenRouter API
2. Filters to monitored families (from `src/data/model-families.json`)
3. Applies family versioning rules (max 3 versions per family)
4. Fetches benchmark scores from ArtificialAnalysis.ai
5. Falls back to provider websites for missing scores
6. Updates `src/data/models.json` with new/updated entries
7. Updates `src/data/providers.ts` to match
8. Reports: "Added X, archived Y, updated Z benchmark scores"

---

## Step 1: Read current state

Read these files before making any changes:
- `src/data/model-families.json` — whitelist and aliases
- `src/data/models.json` — current catalog
- `src/data/providers.ts` — current provider list

---

## Step 2: Fetch OpenRouter catalog

Use the `fetchModelCatalog()` function from `src/data/openrouter.ts` as reference, but since this is an agent command, use WebFetch directly:

```
GET https://openrouter.ai/api/v1/models
Accept: application/json
```

From the response `data` array, filter models whose `id` starts with any `openrouterPrefix` defined in `model-families.json`.

**If OpenRouter is unavailable:**
Log: "⚠️ OpenRouter unavailable — catalog not updated. Benchmark scores may still be fetched."
Skip to Step 4 using existing `models.json` as the base.

---

## Step 3: Apply family versioning rules

For each family in `model-families.json`:

1. Collect all OpenRouter models matching the family prefix
2. Also check `aliases` — if a slug matches an alias, use the alias metadata
3. Extract version from slug:
   - For slugs like `anthropic/claude-3-5-sonnet`, version = "3.5", variant = "sonnet"
   - For slugs like `openai/gpt-4o`, version = "4o", variant = undefined
   - For slugs like `google/gemini-2.5-pro`, version = "2.5", variant = "pro"
   - When uncertain: log "⚠️ Ambiguous slug: [slug] — classified as family=[x] version=[y]"
4. Group by version, collect all variants per version
5. Sort versions newest-first (semantic sort)
6. Keep the 3 newest versions; mark older versions as `isObsolete: true`

**Merge with existing catalog:**
- If a model ID already exists in `models.json`: preserve its `scores` and `scoreSource`, update metadata
- If a model is new: add it with all scores `null` and `scoreSource` all `null`
- If a model is now `isObsolete: true`: update the flag, do NOT delete the entry

---

## Step 4: Fetch benchmark scores from ArtificialAnalysis.ai

**Primary source:**

Fetch the ArtificialAnalysis.ai leaderboard or API. Try these approaches in order:

1. WebFetch `https://artificialanalysis.ai/leaderboards/models` — look for structured data
2. WebFetch `https://artificialanalysis.ai/models/[model-name]` for each model page
3. If an undocumented API exists (check network requests via page inspection hints), prefer it

**Benchmark ID mapping** (ArtificialAnalysis name → our BenchmarkId):

| ArtificialAnalysis | Our ID |
|--------------------|--------|
| HumanEval / MBPP | humaneval |
| MMLU | mmlu |
| GPQA Diamond | gpqa |
| MATH | math |
| Arena ELO / Chatbot Arena | arena-elo |
| MT-Bench | mt-bench |
| LiveCodeBench | livecodebench |
| IFEval | ifeval |
| SimpleQA | simpleqa |
| SWE-bench | swe-bench |
| TAU-bench | tau-bench |
| GAIA | gaia |
| WebArena | webarena |
| AgentBench | agentbench |

For each score found: set `scoreSource[benchmarkId] = "artificialanalysis"`

---

## Step 5: Fallback to provider websites

For any model with `null` scores remaining after Step 4:

Fetch these provider pages for score data:

| Provider | URL |
|----------|-----|
| Anthropic | https://www.anthropic.com/research |
| OpenAI | https://openai.com/research |
| Google | https://deepmind.google/research |
| xAI | https://x.ai/blog |
| DeepSeek | https://api-docs.deepseek.com |

Look for benchmark tables, technical reports, or model cards.
For each score found: set `scoreSource[benchmarkId] = "provider-site"`

If a score is still not found after both sources: leave as `null`, set `scoreSource[benchmarkId] = null`

---

## Step 6: Write updated models.json

Update `src/data/models.json`:

```json
{
  "lastUpdated": "[today's date as YYYY-MM-DD]",
  "models": [ ...all entries... ]
}
```

Each entry must conform to the full ModelEntry schema:
```json
{
  "id": "...",
  "name": "...",
  "provider": "...",
  "openrouterSlug": "...",
  "family": "...",
  "version": "...",
  "variant": "...",         // omit if no variant
  "isObsolete": false,      // or true for archived
  "scores": { ...14 benchmarks... },
  "scoreSource": { ...14 keys... },
  "scrapedAt": "[today's date]"
}
```

---

## Step 7: Update providers.ts

Rebuild the `providers` array in `src/data/providers.ts` to match the updated `models.json`:

- For each non-obsolete model in `models.json`, ensure it exists in the appropriate provider's `models[]`
- For obsolete models: remove from `providers.ts` models array (they are kept in `models.json` but not surfaced via providers)
- New models: add to the correct provider
- Keep `ProviderId`, `Provider` interface, `allModels`, `getProvider()` unchanged

**CRITICAL:** Do not break the existing TypeScript interface. `ProviderModel` must remain the same shape.

---

## Step 8: Report

After all writes, output a summary:

```
✅ Scrape complete — [timestamp]

Catalog: [N] total models across [P] providers
  Added: [list of new model IDs]
  Archived: [list of IDs now isObsolete]
  Unchanged: [count]

Benchmark scores:
  ArtificialAnalysis: [X] scores across [M] models
  Provider sites: [Y] scores across [N] models
  Still null: [Z] scores (manual entry needed)

Build status: run `npm run build` to verify
```

---

## Error handling

- OpenRouter timeout: continue with existing catalog
- ArtificialAnalysis unreachable: skip to provider websites
- All sources fail for a model's scores: leave null, set `scoreSource` to `null`
- Invalid JSON in models.json: abort and report without writing
- TypeScript error after write: report the error for manual fix
````

**Checklist:**
- [ ] File has `---` frontmatter with `description` field
- [ ] All 8 steps clearly numbered and detailed
- [ ] Benchmark ID mapping table included (Step 4)
- [ ] Provider website fallback table included (Step 5)
- [ ] ModelEntry schema shown in Step 6
- [ ] Error handling section covers all 4 error scenarios from about.md
- [ ] Report format matches about.md "Happy Path" output expectations

---

### Task 7: Update models/index.astro — family grouping + obsolete filter

**Estimate:** M
**Files:** `src/pages/models/index.astro`
**Deps:** Tasks 2, 3

**Changes required:**

1. **Filter out obsolete models** from the grid — models with `isObsolete: true` should NOT appear
2. **Group by family** for display — the grid should render family sections rather than a flat list
3. **Preserve ModelBehavior client-side behavior** (filter pills still work; they operate on `data-provider` attributes on cards)

**Implementation approach:**

```typescript
// In the Astro frontmatter (build-time):

// 1. Filter active models only
const activeModels = modelsData.models.filter((m) => !m.isObsolete);

// 2. Group by family
type ModelWithMeta = (typeof modelsData.models)[0];
const familyGroups = new Map<string, ModelWithMeta[]>();
for (const model of activeModels) {
  const family = (model as any).family as string ?? model.provider;
  if (!familyGroups.has(family)) familyGroups.set(family, []);
  familyGroups.get(family)!.push(model);
}

// 3. Sort each family group by version (newest first) — simple string sort is acceptable
// The card grid renders family sections
const familyList = [...familyGroups.entries()].sort(([a], [b]) => a.localeCompare(b));
```

**Template changes:**

Replace the current flat `sortedModels.map()` with a two-level render:

```astro
{familyList.map(([familyKey, familyModels]) => {
  // Get display name from first model's provider
  const firstModel = familyModels[0];
  const provider = providerMap.get(firstModel.provider as ProviderId);
  const familyDisplayName = (firstModel as any).family ?? familyKey;

  return (
    <div class="model-family-group" data-family={familyKey}>
      <h2 class="model-family-label">{familyDisplayName}</h2>
      <div class="model-family-grid">
        {familyModels.map((model) => {
          if (!provider) return null;
          return (
            <ModelCard
              modelId={model.id}
              modelName={model.name}
              providerId={provider.id}
              providerName={provider.name}
              providerLogoPath={provider.logoPath}
              openrouterSlug={model.openrouterSlug}
              scores={model.scores}
              scrapedAt={model.scrapedAt}
              isDeranked={false}
              pricing={null}
              family={(model as any).family}
              version={(model as any).version}
              variant={(model as any).variant}
            />
          );
        })}
      </div>
    </div>
  );
})}
```

**New CSS to add:**

```css
.model-family-group {
  margin-bottom: 2.5rem;
}

.model-family-label {
  font-family: "Syne", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.model-family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.9rem;
}

@media (max-width: 600px) {
  .model-family-grid {
    grid-template-columns: 1fr;
  }
}
```

**Remove** the old `.model-grid` CSS and `#model-grid` div (replaced by family groups).

**Update subtitle** from "15 modelos ranqueados" to dynamic count.

**Checklist:**
- [ ] `activeModels` filters `isObsolete` models out
- [ ] Family groups render correctly with label + inner grid
- [ ] ModelCard called with new `family`, `version`, `variant` props
- [ ] Old `.model-grid` div/CSS removed
- [ ] ModelBehavior component still included (client-side filtering still needed)
- [ ] FilterPills still rendered
- [ ] CSS for `.model-family-group`, `.model-family-label`, `.model-family-grid` added
- [ ] Build passes

---

### Task 8: Update ModelCard.astro — version/variant display + obsolete badge

**Estimate:** S
**Files:** `src/components/ModelCard.astro`
**Deps:** Tasks 2, 3

**Changes to Props interface:**

```typescript
interface Props {
  modelId: string;
  modelName: string;
  providerId: string;
  providerName: string;
  providerLogoPath: string;
  openrouterSlug: string;
  scores: Record<string, number | null>;
  scrapedAt: string;
  isDeranked?: boolean;
  pricing?: { prompt: number | null } | null;
  // NEW:
  family?: string;
  version?: string;
  variant?: string;
  isObsolete?: boolean;
}
```

**Destructure new props:**
```typescript
const {
  // ... existing props ...
  family,
  version,
  variant,
  isObsolete = false,
} = Astro.props;
```

**Template changes:**

1. Add version/variant subtitle below provider name (in `.model-card__title-wrap`):

```astro
{(version || variant) && (
  <span class="model-card__version">
    {version}{variant ? ` · ${variant}` : ""}
  </span>
)}
```

2. Add obsolete badge alongside isDeranked badge (in `.model-card__badges`):

```astro
{isObsolete && (
  <span class="model-card__obsolete tag" data-i18n="model_obsolete">
    Archived
  </span>
)}
```

**New CSS:**

```css
.model-card__version {
  font-size: 0.62rem;
  color: var(--muted);
  font-weight: 400;
  opacity: 0.75;
}

.model-card__obsolete {
  padding: 0.18rem 0.45rem;
  border-radius: 4px;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
  background: rgba(100, 100, 100, 0.12);
  color: var(--muted);
}
```

**Note:** `isObsolete` cards are filtered out in `index.astro` before they reach this component. The prop and badge are defensive and also needed for any direct URL access to obsolete model cards.

**Checklist:**
- [ ] `family`, `version`, `variant`, `isObsolete` added to Props interface
- [ ] Version/variant subtitle renders when `version` or `variant` is set
- [ ] Obsolete badge renders when `isObsolete` is true
- [ ] Existing `isDeranked` badge unchanged
- [ ] All existing prop consumers in `index.astro` and `[slug].astro` still work (props are optional with defaults)
- [ ] New CSS classes `.model-card__version` and `.model-card__obsolete` added to `<style>`
- [ ] Build passes

---

### Task 9: Update ModelProfile.astro — "Part of family X" section

**Estimate:** M
**Files:** `src/components/ModelProfile.astro`
**Deps:** Tasks 2, 3

**Context:** `ModelProfile.astro` receives a `model: ModelData` prop. The current `ModelData` interface inside the component is:

```typescript
interface ModelData {
  id: string
  name: string
  provider: string
  openrouterSlug: string
  scores: Record<string, number | null>
  scrapedAt: string
}
```

**Step 1 — Extend the local ModelData interface:**

```typescript
interface ModelData {
  id: string
  name: string
  provider: string
  openrouterSlug: string
  scores: Record<string, number | null>
  scrapedAt: string
  // NEW:
  family?: string
  version?: string
  variant?: string
  isObsolete?: boolean
}
```

**Step 2 — Extend the Props interface:**

```typescript
interface Props {
  model: ModelData
  provider: Provider
  openrouterData: OpenRouterModelData | null
  // NEW:
  familyMembers?: ModelData[]  // all non-obsolete models in same family (excluding current)
}
```

**Step 3 — Add new section in template** (insert after the Radar Chart section, before Score Table):

```astro
{/* Family section — only render if model has a family and siblings exist */}
{model.family && familyMembers && familyMembers.length > 0 && (
  <section class="profile-section">
    <div class="section-label">family — {model.family}</div>
    <div class="family-members">
      {familyMembers.map((sibling) => (
        <a
          href={`/models/${sibling.id}`}
          class={`family-member-link ${sibling.id === model.id ? 'family-member-link--current' : ''}`}
        >
          <span class="family-member-link__version">
            v{sibling.version}{sibling.variant ? ` · ${sibling.variant}` : ""}
          </span>
          <span class="family-member-link__name">{sibling.name}</span>
          {sibling.isObsolete && (
            <span class="family-member-link__archived">archived</span>
          )}
        </a>
      ))}
    </div>
  </section>
)}
```

**Step 4 — New CSS for family section:**

```css
.family-members {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.family-member-link {
  display: inline-flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s, background 0.15s;
  min-width: 120px;
}

.family-member-link:hover {
  border-color: rgba(124, 106, 245, 0.4);
  background: var(--surface2);
}

.family-member-link--current {
  border-color: var(--accent);
  background: var(--surface2);
  pointer-events: none;
}

.family-member-link__version {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.family-member-link__name {
  font-family: "Syne", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
}

.family-member-link__archived {
  font-size: 0.58rem;
  color: var(--muted);
  opacity: 0.6;
  font-style: italic;
}
```

**Step 5 — Update the call site in `src/pages/models/[slug].astro`:**

The `[slug].astro` page calls `<ModelProfile>`. It needs to:
1. Import `modelsData` from `../../data/models.json`
2. Build `familyMembers` array from models with same `family` as current model
3. Pass `familyMembers` to `ModelProfile`

```typescript
// In [slug].astro getStaticPaths or page-level code:
import modelsData from "../../data/models.json";

// After getting current model:
const allModelsData = modelsData.models as any[];
const familyMembers = currentModel.family
  ? allModelsData.filter(
      (m: any) => m.family === currentModel.family && !m.isObsolete
    )
  : [];
```

Then in the template: `<ModelProfile model={model} provider={provider} openrouterData={orData} familyMembers={familyMembers} />`

**Note:** `[slug].astro` is NOT in the scope files list but MUST be updated for this section to work. Add it as a required change.

**Checklist:**
- [ ] `ModelData` interface in component extended with `family`, `version`, `variant`, `isObsolete`
- [ ] `Props` interface extended with `familyMembers?: ModelData[]`
- [ ] Family section renders only when `model.family` is set AND `familyMembers` has entries
- [ ] Current model highlighted with `.family-member-link--current` and `pointer-events: none`
- [ ] Archived siblings shown with "archived" label (support for future when siblings may be obsolete)
- [ ] CSS added for all new family-related classes
- [ ] `[slug].astro` updated to compute and pass `familyMembers` prop
- [ ] Build passes

---

## Batching

**Batch 1: Schema Foundation** (Tasks 1, 2, 3, 4)
- Extend interfaces, populate all 15 existing models with new fields, create model-families.json
- Commit: `feat(F0002): extend model schema with family/version/variant fields and create model-families.json`
- Build gate: `npm run build` must pass before proceeding

**Batch 2: Data Utilities + Scrape Command** (Tasks 5, 6)
- Add fetchModelCatalog() and create scrape-models.md command
- Commit: `feat(F0002): add fetchModelCatalog() and /scrape-models agent command`
- No build impact (new function only, command file is markdown)

**Batch 3: Frontend** (Tasks 7, 8, 9)
- Update all UI components (index.astro, ModelCard, ModelProfile)
- Commit: `feat(F0002): add family grouping UI, version badges, and family profile section`
- Build gate: `npm run build` must pass and generate all pages

---

## Spec Checklist

| # | Area | Type | File(s) | Expected |
|---|------|------|---------|----------|
| 1 | Data Layer | interface | `providers.ts` | `ProviderModel` has `family`, `version`, `variant?`, `isObsolete?` |
| 2 | Data Layer | data | `providers.ts` | All 15 models have `family` + `version` populated |
| 3 | Data Layer | schema | `models.json` | All 15 entries have `family`, `version`, `variant?`, `isObsolete`, `scoreSource` |
| 4 | Data Layer | file-create | `model-families.json` | 9 families, aliases for known slug ambiguities |
| 5 | Data Utility | function | `openrouter.ts` | `fetchModelCatalog(prefixWhitelist?)` exported, returns filtered models |
| 6 | Data Utility | interface | `openrouter.ts` | `OpenRouterCatalogModel` and `OpenRouterCatalogResponse` exported |
| 7 | Command | file-create | `.codeadd/commands/scrape-models.md` | 8-step scraping workflow with error handling |
| 8 | Command | content | `scrape-models.md` | OpenRouter catalog fetch documented |
| 9 | Command | content | `scrape-models.md` | ArtificialAnalysis.ai benchmark fetch documented |
| 10 | Command | content | `scrape-models.md` | Provider website fallback documented |
| 11 | Command | content | `scrape-models.md` | ModelEntry write format with full schema |
| 12 | Command | content | `scrape-models.md` | providers.ts rebuild instructions |
| 13 | Command | content | `scrape-models.md` | Error scenarios from about.md covered |
| 14 | Frontend | filter | `models/index.astro` | `isObsolete` models excluded from grid |
| 15 | Frontend | grouping | `models/index.astro` | Models grouped by family with `.model-family-group` sections |
| 16 | Frontend | css | `models/index.astro` | `.model-family-label`, `.model-family-grid` styles added |
| 17 | Frontend | prop | `ModelCard.astro` | Props interface has `family?`, `version?`, `variant?`, `isObsolete?` |
| 18 | Frontend | render | `ModelCard.astro` | Version/variant subtitle renders below provider name |
| 19 | Frontend | badge | `ModelCard.astro` | `.model-card__obsolete` badge renders when `isObsolete` true |
| 20 | Frontend | interface | `ModelProfile.astro` | `ModelData` extended with family fields |
| 21 | Frontend | prop | `ModelProfile.astro` | `familyMembers?: ModelData[]` added to Props |
| 22 | Frontend | section | `ModelProfile.astro` | "Part of family X" section with sibling links |
| 23 | Frontend | css | `ModelProfile.astro` | `.family-members`, `.family-member-link` CSS added |
| 24 | Frontend | current | `ModelProfile.astro` | Current model highlighted, `pointer-events: none` |
| 25 | Frontend | update | `[slug].astro` | `familyMembers` computed and passed to `ModelProfile` |
| 26 | Build | validation | all | `npm run build` passes, all 18+ pages generate |
| 27 | Compat | backward | `providers.ts` | `allModels`, `getProvider()`, `Provider`, `ProviderId` unchanged |
| 28 | Compat | backward | `openrouter.ts` | `fetchModelData()`, `fetchAllModels()` unchanged |

---

## Risks e Mitigações

- **TypeScript strictness:** `models.json` is typed via import — the new fields (`family`, `version`, etc.) will be unknown to TypeScript unless a type assertion is used in `index.astro` and `[slug].astro`. Use `as any` cast for new fields or extend the import type. Low risk, well-understood.
- **[slug].astro out-of-scope:** The task coordinator listed it as NOT in scope files, but Task 9 requires it for `familyMembers`. Include it explicitly in Batch 3.
- **model-families.json versioning ambiguity:** DeepSeek uses `deepseek-chat` slug for V3 — the alias covers this. Low risk with explicit alias mapping.
- **`allModels` includes obsolete:** After Task 2, `allModels` flatMap will include entries with `isObsolete: true`. Consumers that need only active models (e.g., `ModelSelector.astro`) should filter. Note this as a known behavior; ModelSelector already has its own data source.
- **Family grouping display names:** The `family` key (e.g. `"deepseek-v"`) is used as the section heading. For cleaner display, the subagent can use the `displayName` from `model-families.json` if imported, or use a simple capitalize/replace approach. KISS: use the family key with first-letter capitalize is acceptable.

---

## Metadata

```json
{"updated":"2026-03-09","sessions":1,"by":"planning-agent","feature":"F0002-model-scraping-update","tasks":9,"batches":3,"specItems":28}
```
