# Model JSON recovery

Villages requests JSON mode for app-generated structured responses. It uses a pinned, bundled copy of `jsonrepair` behind a domain-owned, value-preserving policy. It does not import Engine internals or use Game mode's embedded-fragment parser, which can select an inner array instead of the requested object.

A repair candidate must finish with `stop` or `end_turn`, fit 128 KiB, 64 nesting levels and 32,768 lexical tokens, and require at most eight punctuation edits. Only missing commas or closing delimiters and trailing commas can change. All original data tokens and non-comma delimiters must remain in order. Closing an unfinished response at EOF, creating empty missing containers, inventing values or quotes, selecting partial nested rows, duplicate keys and competing objects are rejected. Model-reported truncation is never repaired. Existing domain validation still checks required fields, IDs, citations, source hashes, attendance, consent, collection completeness and privacy before applying anything.

The original completion stays unchanged in provider checkpoints. Repair candidates share the server-only `villages-private-diagnostics` log with other ordinary diagnostics: 100 recent entries in total, capped at 24,000 characters of redacted response text per entry. Entries are candidates, not claims that domain validation accepted them. The opaque log owns no Gallery media and has no recovery or replay authority. Diagnostic writes are best effort and do not cause generation or replace validation failures.

## Audited request families

| Family                                                                        | Parsing and retained validation                                                                                                                |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Private space preparation and renovation                                      | Bounded object recovery; exactly one matching Venue/Zone and a description; existing claim/seed/source fences                                  |
| Founding Venue drafts, details, descriptions, names and scenario imprint      | Bounded object recovery; existing place/layout/ID validators; legacy arrays must be closed before wrapping; at most two encoded-string unwraps |
| Compact routines and agendas                                                  | Bounded object recovery; complete seven-day pattern and existing routine validation                                                            |
| System intent, exchange, schedule influence and starting ties                 | Bounded object recovery; source hashes, evidence, actor IDs, explicit outcomes and authority remain required                                   |
| Wish lifecycle                                                                | Bounded object recovery; existing eligibility, affected-person and evidence checks                                                             |
| Scene narration, speech recovery, effect retry and consequential verification | Bounded recovery before existing schema/identity/privacy checks; existing narrow recovery of untouched Scene core fields remains separate      |
| Spinoff memory review                                                         | Bounded model-object recovery followed by transcript and memory validation                                                                     |

Saved settings, persisted JSON, image-service protocol payloads, authored data and typed Decisions responses do not acquire model-text repair. The existing narrowly scoped Scene partial-core recovery is preserved, not broadened into invented effects or completed updates. No repair changes request fingerprints, provider budgets, retry authorization or timeout policy.
