# Scene cost characterization

The current architecture uses one GM response, `{input, segments, events?}`, followed by provider-free validation and application. The model supplies fiction, audible input selections and meaningful proposals. Code derives exact offsets, source identities, witnesses, revisions, defaults and native operations. Full authored identities remain intact. There are no automatic Memory, Wish, Project or access critics.

The cost target remains unmet. The latest three warm ordinary conversations averaged **1.65× Game Mode**; the engineering aim is 1.0–1.25×. Earlier small samples averaged 1.36×, 1.74× and 1.75×. The changing histories and small samples do not establish a causal improvement between these iterations. An earlier explicit learning request was acknowledged without a persisted Memory and remains a semantic failure; the latest new learning did persist correctly. These are observations, not a general parity claim or a measured reduction from the previously established 3× baseline.

## Revisions and integration

- Villages staging base: `9251988b00ec3ebaf743d4337d30cb4e71d1f0f1`.
- Current integration target: Engine staging `73441f9a620dfdd94a28b94b68aa8f8b8ef1321c`, version 2.5.2, Capability API 1.818. Exact unmodified source was built and activated in the same isolated Linux world. Installed package bytes, saved records/assets, model settings and credentials passed guarded checks; startup purchased no model requests. The default runtime pin and personal installations were unchanged.
- The first 49 provider requests used Engine staging `27805040eed0d91d4ea7b49f478b0b197b13676d`; the next 40 used `73441f9a620dfdd94a28b94b68aa8f8b8ef1321c`. Each measurement stage identifies its actual Engine revision. The newer revision reproduces the identical public declaration closure. Its Advanced Memory changes do not participate in this baseline: the native Game chat has no saved Advanced Memory setting and the default is disabled.
- Earlier successful sample product source: `485e7214b810ba28d74af06904be796cda9c3b02`; archive SHA-256 `fe904498414b77d30a7d62a7b841748ea66571f38c7ba51d05c4d7ab696f0d96`. Subsequent source and archive identities are retained per sample in the measurements.

The API requirement and generated public declaration closure are in [#458](https://github.com/DSBwizzard/marinara-villages-agent/pull/458). Stable authored prompt prefixes and request/cache accounting are in [#459](https://github.com/DSBwizzard/marinara-villages-agent/pull/459). The coupled Scene contract, native consequences, context selection, retirement and measurement harnesses are in [#460](https://github.com/DSBwizzard/marinara-villages-agent/pull/460). Source merging and runtime deployment remain separate outcomes.

## Actual provider usage

All pairs used the saved `deepseek-flash` connection through the native Engine Game and Villages HTTP paths. The stored synthetic Mara card and player inputs matched; each mode generated its own continuing history. Background work and images were disabled in the isolated world. Saved model and reasoning settings were preserved. The five earlier pairs below had no contract failures, consequential application failures, replacement requests or replay purchases.

Each cell below gives Villages / Game Mode. Reasoning is already included in output totals and is charged once. Cache writes were unreported, not zero. Costs use provider-reported tokens multiplied by the published rate, rather than invoice amounts.

| Earlier validated pair | Input tokens | Cache reads | Output tokens | Reasoning tokens | Rated USD | Latency seconds | Cost ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Changed-prefix warmup | 10,848 / 8,106 | 2,688 / 7,424 | 631 / 422 | 45 / 36 | .001610664 / .000377772 | 8.30 / 5.80 | 4.26× |
| Ordinary patience | 11,741 / 8,509 | 10,240 / 7,680 | 889 / 644 | 245 / 319 | .000789270 / .000533790 | 9.83 / 7.68 | 1.48× |
| Ordinary craft | 12,781 / 8,851 | 11,136 / 8,192 | 501 / 578 | 84 / 150 | .000580758 / .000470226 | 6.69 / 7.02 | 1.24× |
| Corrected-Memory recall | 13,481 / 9,298 | 12,160 / 8,448 | 349 / 355 | 66 / 107 | .000444030 / .000365844 | 4.97 / 4.60 | 1.21× |
| New remembered information | 13,991 / 9,579 | 12,800 / 8,960 | 746 / 548 | 280 / 236 | .000664650 / .000448530 | 7.27 / 6.16 | 1.48× |

The final pairs ran after 10:00 UTC on 2026-11-09 at Flash off-peak rates per million tokens: $0.15 uncached input, $0.003 cached input and $0.60 output. Earlier recorded iterations used the then-applicable peak rates, twice those amounts. See [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/). Absolute dollar changes across this boundary do not demonstrate a product improvement.

[The machine-readable measurements](scene-cost-results.json) retain all 89 reported requests across eighteen sample files, including cold prefixes, expensive Memory interpretation, one explicit replacement and intermediate layouts. Their known rated cost is $0.095928399; invoice cost is unavailable. The 45 Village requests and 44 Game requests also match the native usage ledger and paired Game history. No intermediate attempt has been removed from the spend total. Provider-internal HTTP retries are not exposed by the public Engine APIs. The tracked Village capability attempts and Game request counts are the observable request accounting; unknown billing must never be treated as free.

An earlier follow-up includes three runtime-failed comparisons. A scalar source on an optional cosmetic cue rejected an otherwise usable response; the fix now discards invalid cosmetic cues while keeping consequential validation strict. Its already-rejected receipt remained rejected, and one explicit native Retry purchased a replacement using the frozen original prompt. Two later Memory proposals cited invalid or mismatched sources. Their dialogue survived, their unsupported Memory updates did not apply, and native Continue retained both failures. The missing matching Game inputs were then generated separately. Those failed purchases are included above; none counts as a successful consequence or a zero-cost retry.

The preceding pass used product source `a4190b2f847299368308ae2fb91fb2ad16674c17`, archive SHA-256 `24b31e4532750f68b15b30b775e99a20133fb5dfc55dda2312b9395460b59ab2`, on Engine `73441f9a`. Its six pairs purchased one request per mode per input, with zero replay purchases or native validation failures:

| Preceding pair | Rated USD, Villages / Game | Cost ratio | Observed behavior |
| --- | ---: | ---: | --- |
| Changed-prefix warmup | .002752608 / .000425994 | 6.46× | Dialogue completed; transition cost retained |
| Ordinary quiet | .000616206 / .000368196 | 1.67× | Dialogue completed |
| Ordinary outside sounds | .000546792 / .000410448 | 1.33× | Dialogue completed |
| Ordinary time of day | .000837894 / .000365250 | 2.29× | Dialogue completed |
| Learn kettle name | .001003164 / .000424302 | 2.36× | Failed semantic check: acknowledged “Tawny” but emitted no Memory |
| Recall kettle name | .000466650 / .000458154 | 1.02× | Immediate Scene-history recall only; no long-term Memory proof |

The native Memory owner inspection still contained the same three records after that pass; none contained Tawny. Completion status therefore does not establish successful persistence.

The latest ordinary-conversation sample used product source `742a861737191ca8a1bbe0ab5ba4e1f52f73526f`, archive SHA-256 `c19230399f1f2857e3efc8c36e27419f598203f0699afdd068786e8818c6cf37`, on the same Engine. It clarifies meaningful lasting learning and supplies Project grammar together with full terms only when relevant. All ten requests completed without native validation failures; replay and the subsequent restart purchased zero additional requests.

| Latest pair | Rated USD, Villages / Game | Cost ratio | Observed behavior |
| --- | ---: | ---: | --- |
| Changed-prefix warmup | .003545850 / .000501306 | 7.07× | Cold Village prefix retained in spend |
| Ordinary company | .000516756 / .000378408 | 1.37× | Dialogue completed |
| Ordinary window light | .000512658 / .000368544 | 1.39× | Dialogue completed |
| Ordinary rainy day | .000823044 / .000374712 | 2.20× | Dialogue completed |
| Learn family craft history | .001222962 / .000613164 | 1.99× | New private report Memory persisted and survived restart |

The new native Memory records the player's report that father Rowan taught chair repair and made the wooden mallet. It cites exact audible `input:0`; only Mara is a knower, and player is a subject rather than an automatic added knower. The owner inspection grew from three to four Memories. Exact owner records and Game history survived an ordinary restart with no added requests. This establishes persistence for that fact; it does not repair the earlier missed name or establish broad semantic reliability.

The subsequent Memory-focused pass used product source `80637e6edb6ca8cde8fde04cd5eb4619e804e5a7`, archive SHA-256 `2e6b73faa731fa5c765a17cb2462319fd3ee756a28115c6c35827d370d07e4c2`, on the same Engine. It clarifies that code supplies full exact support when every cited source is at most 320 UTF-8 bytes; only longer or mixed sources need model-selected excerpts. All six requests completed with zero native validation failures or replay purchases.

| Memory-focused pair | Rated USD, Villages / Game | Cost ratio | Observed behavior |
| --- | ---: | ---: | --- |
| Changed-prefix warmup | .003632292 / .000395916 | 9.17× | Transition cost retained |
| New childhood-village report | .000801054 / .000559068 | 1.43× | New private Memory; 130-byte source needs no duplicate model quote |
| Long qualified correction | .001466040 / .000455070 | 3.22× | Correction and condition persisted; selected excerpt has a quality gap |

The correction advanced the same Memory root to revision 2 and retained “only when cousin Delia can come; otherwise stay home,” replacing the broader annual-visit claim. Mara remains the sole knower, with report attribution to player. Both complete original submissions remain in native Scene history and the correction's source receipt matches its actual submission. The chosen excerpt names the fair date rather than the important attendance condition. The Memory text and full source preserve that condition, but the excerpt is weak; the measurements record this as a separate semantic quality gap. A successful native write alone does not establish good excerpt selection. The short-Memory result does not establish a general 1.5× consequence ceiling.

The next pass used product source `727c3cd3b235f6d4455064446311b9ff8ac9e791`, archive SHA-256 `3ae1dbab36a33655337da9bc5e6c673c4b6b14a2552a7ea617e23dc8b056b82d`, on the same Engine. It clarifies that selected excerpts support material qualifications. A fresh update added the condition that the north path must be open:

| Qualification and relationship pair | Rated USD, Villages / Game | Cost ratio | Observed behavior |
| --- | ---: | ---: | --- |
| Changed-prefix warmup | .004058592 / .000423906 | 9.57× | Transition cost retained |
| Further qualified correction | .001345998 / .000436758 | 3.08× | Root revision 3; excerpt includes both Delia and path-open conditions |
| Friendship declaration | .001290684 / .000473460 | 2.73× | Failed relationship proposal; prose retained, consequence held |

The new Memory correctly targets the supplied current leaf, preserves the player-attributed report for Mara alone, and now quotes both material conditions. The 72-byte excerpt does not repeat every incidental detail from the 455-byte source; full original input remains retained. This fixes the observed missing-condition problem in that new exchange, without rewriting the earlier weak-excerpt record or establishing general semantic reliability.

The friendship reply omitted the spoken player offer with `input:[]` and cited segment 9 despite returning only segments 0–8. It also proposed an accepted agreement containing newly introduced terms without the player assenting to those terms. Code held the unsupported relationship consequence. Native Continue preserved it as rejected with zero additional requests, and only the missing matching Game response was then purchased. The planned Wish pair in that stopped run was never purchased. Follow-up guidance clarifies source numbering and actual mutual assent; error reporting preserves the original source-validation cause rather than replacing it with a missing internal field.

The follow-up used product source `b2ebc0098541e6dfb78ceadc0252ca2ecab3c9ec`, archive SHA-256 `06b1eb3d87820c35f3f0e163c1cd8a8af1516c2093ee0fe22c6afa6785d80632`, on the same Engine. All six requests completed without native validation failures or replay purchases:

| Assent and Wish pair | Rated USD, Villages / Game | Cost ratio | Observed behavior |
| --- | ---: | ---: | --- |
| Changed-prefix warmup | .004806702 / .000376446 | 12.77× | No agreement accepted merely in response to thanks |
| Explicit mutual assent | .002203542 / .000585498 | 3.76× | Friend connection and accepted agreement persisted with both actual assents |
| Personal Wish | .002181012 / .000519516 | 4.20× | Open boat Wish persisted, but spoken player question was omitted from capture |

Native inspection before and after the warmup showed no accepted agreement. After explicit assent, the new agreement cited both the player's full statement and Mara's agreeing speech via `input:0` and generated segment 1. The earlier invalid proposal remains rejected. The Wish belongs to Mara, remains open, preserves the stated boat/ownership desire and starts no Project work. However, its response again returned `input:[]` for a direct spoken question. That turn is a semantic failure despite its valid Wish write. Totals therefore include four runtime failures, two separately identified semantic failures and the earlier excerpt quality gap. The expensive successful agreement and incomplete Wish case do not meet the consequential-cost aim. Further input-capture and cost work remains; no new shortcut or inference has been implemented.

## What improved and what remains

Stable rules, complete authored cards/world/player context and a captured Scene reference precede appendable chronological witnessed history. Current time, Memory, social and Project context and presentation follow it. Three public cache breakpoints are retained through fitting and replay. The growing history message has no explicit breakpoint: block-oriented providers cannot reuse part of a changing block as though it were immutable. DeepSeek cache reads above establish actual automatic-prefix reuse for this sample; no live explicit-cache provider was tested. Cache TTL was not overridden.

History has one model representation and no independent fixed rolling window. Only actual model context pressure prunes optional complete rows in bounded batches; latest exchanges, identities and exact input remain whole. Compact rows retain canonical IDs, speakers, kinds and full text; explicit overrides preserve subset/empty hearing, acoustic-only evidence and nondefault visibility. Cast changes rebuild privacy projections. Full server evidence is frozen with the fitted messages; retries cannot acquire new sources or buy a replacement merely to apply an existing response.

Native Memories retain individual knowers, reports versus observations, exact accepted support and Forget/Correct protection. The live test created a private report, corrected its subject from grandmother to great-aunt without losing its root lineage, recalled the correction after a package restart, and recorded a second report about a blue kettle. Mixed private thought and speech retained the exact original submission while only “The bench looks well cared for.” acquired Mara as a witness. These checks establish those particular outcomes, not general semantic reliability.

Current Wishes remain compact characterization context, with complete relevant conditions and history before fulfillment judgments. Project terms are narrowed conservatively; approval, builder willingness, conditions, refusal, withdrawal and Start remain distinct. Relationships retain directional qualitative perspectives and authoritative agreements. Standalone social intentions and duplicate Scene disclosure proposals are retired. The old all-input classification and domain transaction model contract are replaced by sparse source selections/events. Existing native domain validators remain authoritative. Village format 17 and relationship contract 4 reject older saves without migration.

Remaining cost comes from complete source metadata on newly appended history, current authoritative context, JSON/output structure, natural differences in prose and provider reasoning. In the latest three warm ordinary pairs, visible output was 1,035 tokens versus 981. Reported reasoning was 916 versus 137, accounting for about 64% of the $0.000730794 excess cost; uncached input accounted for about 24%. Reasoning is already part of total completion tokens. Both modes retained their saved settings and the provider's default thinking effort; an omitted effort option does not mean thinking was disabled. More prompt text does not necessarily imply greater cost when cached, and this small sample does not establish a universal consequence-cost ceiling.

The sample is one synthetic resident, one continuously growing world and a small set of matched inputs. Generated histories diverged naturally. The native Game prompt represents the stored card differently: exact scenario/example strings were absent from the inspected prompt, while Villages preserves all authored fields. No shortened Villages identity or inflated Game prompt was used to improve the comparison. Broader multi-resident/provider quality and repeated cost samples remain necessary before promising general parity.

Residual cleanup remains for unreachable self-report flag guards and their two obsolete error classes. The strict current Scene root rejects those old flags before those guards can run; they do not provide an accepted legacy response format.

## Repeat the checks

`npm run build && npm run bench:scene -- report.json` runs 17 archive-identical package HTTP fixtures: ordinary conversation, greeting, multiple residents, mixed input, disclosure, relationships, Wish progress/fulfillment, Project discussion/commitment, invitation/refusal, physical change, movement/privacy, combined effects, long history and rich Memory/Wish context. It checks native accepted consequences and provider-free replay. The report contains package/source identities, request counts, contract failures and UTF-8-bytes/4 input estimates. These mocked estimates are explicitly not provider usage or cost evidence.

For explicitly authorized paid testing, prepare an independent quiet native Engine world and Game chat with the same saved connection and authored characters, then run:

```sh
VILLAGES_ENGINE_URL=http://127.0.0.1:PORT \
VILLAGES_ENGINE_ADMIN_SECRET=... \
npm run bench:scene:live -- private-config.json private-report.json
```

The private JSON supplies `sessionId`, `chatId`, `connectionId` and `pairs: [{id, message}]`. Optional `runtimeIdentity` records independently verified installed package/image identities. `pricingProvider` and `rate: {input, cached, output, currency, source, checkedAt}` provide current rates per million tokens. Keep credentials, runtime IDs, copied content, raw prompts and private preview metadata outside Git. Port 8500 is refused. The driver does not initialize/reset a world, change connection settings, or authorize spending by itself.

An explicitly authorized native Retry can supply the original `submissionId` and current `retryOfAttemptId` on its pair. Retain the original failed report and include its cost with the retry; this does not authorize an automatic replacement or resurrect rejected output.

Review consequences and captured identities alongside usage. The deterministic inventory covers privacy, exact repeated/Unicode input, source validation, full Wish conditions, Project/access authority, repairs, real time, cancellation, concurrency and replay. It cannot prove that a provider always recognizes fictional meaning correctly. Native Windows full Engine client compilation was not established locally; the exact Linux staging runtime and Villages Linux/Windows CI provide the recorded integration and platform evidence.
