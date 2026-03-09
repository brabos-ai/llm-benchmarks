# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public issue.** Instead, please email the maintainer or use [GitHub's private vulnerability reporting](https://github.com/xmaiconx/llm-benchmarks/security/advisories/new).

We will acknowledge your report within 48 hours and aim to provide a fix within 7 days for critical issues.

## Scope

This is a static site (Astro SSG) hosted on Cloudflare Pages. The primary security concerns are:

- **Supply chain** — Compromised npm dependencies
- **Data integrity** — Tampered benchmark data in `src/data/`
- **XSS** — Injected content via model names or benchmark labels

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `main` | Yes |
| Older releases | No |
