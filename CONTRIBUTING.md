# Contributing to LLM Benchmarks

Thank you for your interest in contributing! This guide will help you get started.

## How Can I Contribute?

### Reporting Bugs

- Use the [Bug Report](https://github.com/xmaiconx/llm-benchmarks/issues/new?template=bug_report.md) issue template
- Include steps to reproduce, expected vs actual behavior, and screenshots if applicable

### Suggesting Features

- Use the [Feature Request](https://github.com/xmaiconx/llm-benchmarks/issues/new?template=feature_request.md) issue template
- Describe the problem you're trying to solve and your proposed solution

### Adding or Updating Model Data

- Model benchmark data lives in `src/data/models.json`
- Provider metadata is in `src/data/providers.ts`
- Make sure all scores are sourced from official benchmarks and include references

### Submitting Code

1. **Fork** the repository and create your branch from `main`
2. **Install** dependencies with `npm install`
3. **Develop** with `npm run dev`
4. **Test** your changes with `npm run build` to ensure the site builds successfully
5. **Check** types with `npm run check`
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation only
   - `style:` formatting, no code change
   - `refactor:` code restructuring
   - `chore:` tooling, config, dependencies
7. **Push** and open a Pull Request

## Development Setup

```bash
git clone https://github.com/xmaiconx/llm-benchmarks.git
cd llm-benchmarks
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Code Style

- **TypeScript** for all `.ts` files
- **Astro components** for UI (`.astro`)
- Keep components small and focused
- Use semantic HTML
- Follow existing naming conventions

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Fill out the PR template completely
- Ensure `npm run build` passes
- Update documentation if you change public APIs or add features
- Add screenshots for visual changes

## Questions?

Open a [discussion](https://github.com/xmaiconx/llm-benchmarks/discussions) or reach out via issues.
