# Marinara Agents compatibility and contributions

Villages is a standalone optional Marinara package. Follow the current upstream [AGENTS.md](https://github.com/Pasta-Devs/Marinara-Agents/blob/main/AGENTS.md), [CONTRIBUTING.md](https://github.com/Pasta-Devs/Marinara-Agents/blob/main/CONTRIBUTING.md) and [agent workflow](https://github.com/Pasta-Devs/Marinara-Agents/blob/main/.github/agents/chai-workflow.md) when preparing a contribution. Recheck these live rules; this document is not a frozen substitute.

## Product engineering

Use the smallest focused change and existing Engine services. Package source owns its behavior. Keep supported modes, permissions, public capability API, Engine compatibility, entrypoints, storage lifecycle and restart behavior accurate. Never lower compatibility metadata to reach a stable catalog lane. The package definition and engine-boundary.json own our declared boundary; the builder/verifier check consistency and private-import prohibitions.

Regression proof should protect observable behavior and relevant failure cases. Do not create speculative layers, boilerplate or tests for instruction-only edits. Independent technical review covers material saving/privacy/spending/recovery/architecture work. Report actual coverage and remaining gaps; automated proof never becomes an invented manual verification.

## Local development versus the official catalog

This standalone source repository ignores generated bundles and ZIPs. Its CI prepares a reproducible package with source and archive identities. The official catalog repository instead commits generated payloads, manifests, ZIPs, locales and catalog entries together when payloads change. Rebuild these through upstream's owning builders; never hand-edit generated hashes or archives.

Before upstream submission, inspect the affected manifest, builder, payload and documentation as one unit. Check category, supported modes, permissions, Engine min/max, builtAgainst provenance, public APIs and install/update/restart/offline/uninstall behavior where relevant. The current source boundary uses public declarations/runtime exports only; the dynamic Engine image-style export and optional native image decoders need their separately identified runtime coverage, not a claim that source-only tests exercised them.

## Upstream submission

1. Obtain authorization to contribute upstream, then open/link the required issue and check existing ownership.
2. Branch from current upstream staging and open a focused draft PR there. Do not submit ordinary work to upstream main.
3. Rebuild the narrowest affected packages and catalog lanes. Include the generated outputs required by that repository; preserve lane compatibility and staging-only/incomplete visibility rules.
4. Run upstream's current check, catalog-lane, locale, catalog, release-note regression and diff checks, plus affected package behavior tests. Document actual install/update/activation/restart/offline/uninstall verification and gaps. Minor/major releases need the required package changelog entry.
5. Mark ready after self-review and validation. Required catalog/security/quality/dependency checks and CodeRabbit must pass. Outside/first-time contributors also need the current-head approval required from SpicyMarinara. An internal read-only review agent is additional review, not a substitute.
6. Only the upstream owner promotes tested staging work to main. Leave manual verification checkboxes unchecked unless a human actually performed them. Never include credentials, private world data or personal-only features.

Local standing staging authorization does not authorize upstream issues, PRs, merges or publication.
