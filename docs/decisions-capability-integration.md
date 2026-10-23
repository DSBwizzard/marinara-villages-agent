# Decisions capability integration

Villages uses the optional `api.runtime.decisions.evaluate()` capability introduced by [Engine PR #7369](https://github.com/Pasta-Devs/Marinara-Engine/pull/7369). The public declarations are pinned to its merge revision; see [provenance](../sources/engine-public/PROVENANCE.md). This is a 0.7.2 integration candidate for testing, including natural nearby attention.

Decisions is off by default. The adapter checks capability presence, without probing a model or making a request. Engine 2.5.0 builds before the capability was introduced use System interpretation. There are no private Engine imports, build allowlists, connection lookups, or direct Decision backend access in package code.

## Responsibility

| Judgment | Decisions | System | Deterministic Villages code |
| --- | --- | --- | --- |
| Wish progress or fulfillment | Narrow current conversation or the meaning of one qualifying physical receipt | History, conditions, discoveries, mixed or complex goals, uncertain answers | Wish identity and freshness, witnesses, receipt eligibility, proof kind, progress/reward application |
| Project speech | One person's approval or commitment to one bounded target | Ambiguity, competing targets, conditions, other Project judgments | Actor authority, Project identity and design revision, explicit Start, elapsed time and updates |
| Venue speech | A current invitation, refusal or dismissal with one supporting speaker line | Lasting bans, opening-hour exceptions, complex context or conflicting targets | Current controller authority, Zone availability, saved evidence, permission scope and movement |
| Nearby attention | A simple whole-message routing choice with complete context within the public question limit | Fragment extraction, mixed/private content, shortened history, oversized context or uncertainty | Direct narrow knocks, adjacency, live doorway routes, plan binding, actual hearing and physical success |
| Other gameplay | No new Decision use | Existing interpretation owners where meaning is needed | Existing checks and state transitions remain authoritative |

Negative scores are never interpreted as refusal or proof that something did not happen. Only one valid positive outcome, with all alternatives present and valid against the Engine-provided threshold, can be selected. Missing, malformed, conflicting or unavailable answers leave the check for System.

## Evidence and limits

`decision-candidates.ts` admits the narrow task and creates self-contained questions. Every question includes the target and full admitted evidence, including speaker identities, current/history markers and evidence kind. Wish questions retain the original goal and timing. They do not depend on Engine message trimming or a private model context budget. If complete questions exceed the public 500-character limit, or a batch exceeds 32 questions, System handles it. A smaller Engine-configured question limit can also reject the optional attempt and trigger fallback.

Positive results carry the exact supporting evidence IDs and a fingerprint of the interpreted check. Consumers validate this binding before applying Wish, Project or Venue effects. Physical Wishes additionally require the existing canonical, witnessed action receipt. Legacy unbound Decision results cannot gain authority during replay, including already interpreted greeting/turn checkpoints that contain an invitation signal.

New saved invitation and access effects carry an internal validation version. Older pending effects without interpreter provenance are held, with a Scene question explaining that fresh permission must be established. Existing applied permissions are retained. A complete older System interpretation can still be validated at the reply checkpoint boundary; an unversioned effect alone cannot establish its origin. This conservative compatibility boundary avoids both unverifiable access changes and automatic repeat requests.

Admission filters only route work; their phrase tests do not establish gameplay truth. Model scores interpret meaning within the admitted evidence. Villages still checks actual state and permissions at application time. Provider-free fixtures do not establish model accuracy or real-world latency savings.

Attention retains its compact System history profile. A Decision can use that history only when the selected lines are complete, and each question retains the current input, current Zone, destinations, live open routes, known local recipients and actual evidence kinds, including whispers. Reading a Decision result rechecks the binding. Cooked plans and pending doorway choices also carry an internal binding to the original input/context and plan contents. Unverifiable legacy or changed plans are held without another model call or remote witness effect; editing the preserved draft starts fresh interpretation. Settled submissions retain their recorded behavior.

New Scene requests use interaction contract version 3. Already admitted version 2 requests retain their original System payload and request fingerprint, so saved paid work replays without a fresh Decision or duplicate System call. Version 1 retains its earlier routing behavior. Version 2 pending plans without the new context binding still require a fresh player action.

## Requests, recovery and diagnostics

Successful Decision checks do not request a System comparison. Remaining checks share one System fallback batch. Diagnostics show scores, model metadata, routing or rejection reasons, fallback and application results; reading diagnostics makes no model request. Legacy comparison settings and records are inert.

Scene and background owners supply cancellation and a shared ten-second allowance for optional attempts. Background settings are frozen per job. Optional attempts are reserved before dispatch, persisted for replay, and fenced by activation, job identity and attempt. Cancellation, supersession and failed persistence cannot authorize an automatic System request. An uncertain saved attempt is not repeated automatically; explicit recovery can proceed through System. Once a System checkpoint has been purchased, its original batch replays without a new Decision changing request identity.

New Wish jobs use contract version 3. Existing version 2 jobs keep their original System-only request and replay format. No Wish preparation model call is added.

Accounting records capability attempts and any returned model name. The API does not provide provider billing, token usage or cost, so those remain unknown. Capability accounting does not inspect Engine connections or guess prices.

## Validation and review

Provider-free regressions cover feature absence, adapter lifetime and cancellation, conservative scores, evidence changes, narrow Wish/Project/room routing, legacy replay, background visibility and replacement, persistence failure, shared allowance, diagnostics privacy and capability accounting. The Engine-dependent transport test exercises the official capability with a synthetic local provider, including request validation, calibration, trimming, cancellation and linked credentials. It requires an already built post-PR runtime; building Engine is outside ordinary Villages validation.

Before accepting this candidate, test with an Engine runtime exposing the capability: enable Decisions, exercise a narrow witnessed Wish or invitation, and inspect the applied evidence and request counts. Then exercise a conditional or ambiguous case and verify System fallback. Test replay and cancellation without repeated model requests. Keep it separate from a release until these integration and gameplay checks are satisfactory.
