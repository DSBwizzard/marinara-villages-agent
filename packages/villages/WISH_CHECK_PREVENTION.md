# Wish-check prevention — 0.6.146

## Behavior and safety

The versioned Wish response contract replaces wire check/evidence IDs with request-local `cN`/`eN` aliases. Canonical persisted IDs and routes remain unchanged. Aliases decode before per-check witness, current-citation, receipt and Wish-identity validation. Reasons are bounded; no provider-enforced schema is assumed for the inspected custom connection.

New checks estimate compact result serialization at three characters per token, reserve 3,072 tokens for reasoning and 512 for variance, and clamp the allowance to 1,024–4,096 and the connection ceiling. A connection ceiling below 1,024 is caught before spending. New daily proposals use a 4,096 ceiling; retained generation inputs keep their 1,500 allowance and saved responses. These are ceilings, not promises about actual usage or cost.

Valid batch rows commit independently with canonical effect receipts. Invalid rows remain unfinished. Deliberate paid retries freeze and request only remaining rows; repeated retry action IDs and effect application are idempotent. Recovery applies prepared responses locally after storage/application failures, retires inapplicable canonical Wishes/residents/villages, and settles Scene bookkeeping. Saved legacy layouts remain replayable. Unknown paid outcomes remain blocked; upgrades and recovery never authorize replacement model requests.

Missing physical proof and honest semantic uncertainty settle without granting unsupported effects. Truncated responses are withheld even when a JSON prefix can be parsed. Structured failure metadata distinguishes output limits, blank output, malformed JSON, missing/duplicate rows, unsupported outcomes, invalid citations, provider exceptions, uncertain requests and storage/application errors.

The panel separates running/queued, paused and attention-needed work. Completed history is collapsed; failure age and cause are visible. Existing statuses, routes and deliberate retry controls remain compatible.

## Bounded live evaluation — October 3, 2026

Baseline: staging 0.6.144 (`ff53391`). Initial candidate: this feature's first sizing draft (512 reasoning +256 safety), before the larger final reserves. Connection: the selected custom `claude-opus-4-6` connection, portable JSON, low reasoning effort.

Eight frozen cases per arm covered recognition, a physical plan without proof, mixed physical/conversational progress, ambiguity, compound conversation, an unsupported physical claim, a four-resident private-witness batch and daily generation. Two physical cases per arm settled locally. Thus the comparison spent 12 requests; four fixed 4,096-token probes used the remaining authorized allowance. Total **16 requests**, no automatic retries, no live village/gameplay writes, no pricing calls.

The isolated adapter matched the inspected custom connection's non-streaming chat request parameters. Installed Engine provider imports failed against its shared dependency, so the evaluation used a guarded HTTP adapter rather than building or starting Engine. Package storage was in memory. This tests package interpretation against that endpoint; it does not certify the full Engine dispatch path.

| Run | Model requests | Truncated responses | Usable model responses | Reported input / output tokens | Median model latency |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0.6.144 | 6 | 6 | 0 | 7,392 / 4,572 | 12.34 s |
| Initial candidate | 6 | 6 | 0 | 7,332 / 6,737 | 11.11 s |
| Fixed sizing probes | 4 | 1 | 3 | 5,437 / 11,208 | 12.41 s |

The initial candidate did **not** reduce truncation. The two locally rejected physical cases were correct in both arms. Baseline daily generation marked its parsed response completed despite a length finish reason; the candidate withheld it. Other semantic judgments could not be certified from truncated answers.

At 4,096 tokens, mixed progress, ambiguity and the private batch returned valid cited results. They used 2,047, 1,345 and 3,720 output tokens respectively. The private batch settled two agreements, one partial discussion and one unrelated no-change result without cross-witness citations. Recognition still exhausted 4,096 tokens while reconsidering the same condition; its positive JSON was withheld.

The recognition fixture's initial expected full fulfillment was overly broad: one speaker did not establish recognition by the named group. It is not evidence of a model miss. No unsupported positive was accepted. Gameplay application and duplicate-effect prevention were checked separately with mocked storage, not with live village writes.

Provider usage reported zero reasoning tokens despite separate reasoning content. Reported output therefore must not be interpreted as visible JSON size. The final reserve and daily-generation ceiling were increased after these observations; **the final sizing has no further live rerun**, because the authorized request budget was exhausted. These small probes support more headroom, not a production failure-rate claim. A looping model or lower connection ceiling can still leave unfinished work requiring attention.

Larger allowances can increase actual cost. The mocked six-turn replay retains about 6,171 character-estimated tokens with compact answers, but its full ceiling is 28,129 tokens; the previous claim of 90% savings at the full ceiling no longer applies.

## Verification

Regressions cover aliases and private witnesses; compound and physical Wish guards; honest uncertainty; blank, truncated and malformed output; missing/duplicate rows; valid rows alongside failures; legacy response replay; unfinished-only retry; failure age and causes; stale retirement; and receipt idempotency.

Injected faults cover response checkpoint storage, prepared-result storage, effect persistence and lost acknowledgements. Restart/local recovery and explicit retries reuse durable responses; uncertain response storage does not cause an automatic request. Daily proposals retain quiet-day behavior and expose typed output diagnostics. Desktop/mobile browser coverage verifies panel grouping, collapsed history and lost retry-response idempotency.

Run `npm run check`, the relevant Wish/interpretation/exchange/coordinator/recovery regressions, and the background/Scene recovery browser tests. Rebuild generated package output only with the documented build command.

The evaluation harness is `scripts/evaluate-wish-prevention.mjs` (through `node --import tsx`). It defaults to preparation without network calls, journals reservations before dispatch and refuses repeating a ledger with paid requests. Re-running paid evaluation requires separate authorization and a separately reviewed run ledger. Local full reports remain under ignored `artifacts/wish-prevention-evaluation/`; credentials and reasoning transcripts are not part of this release record.
