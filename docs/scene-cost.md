# Scene cost characterization

The current architecture uses one GM response, `{input, segments, events?}`, followed by provider-free validation and application. The model supplies fiction, audible input selections and meaningful proposals. Code derives exact offsets, source identities, witnesses, revisions, defaults and native operations. Full authored identities remain intact. There are no automatic Memory, Wish, Project or access critics.

The cost target is close, but not established across gameplay. In the final small live sample, the two warm ordinary conversations cost **1.36× Game Mode in aggregate**; the engineering aim is 1.0–1.25×. A corrected-Memory recall cost 1.21× and a new Memory cost 1.48×. A turn rebuilding the changed history prefix cost 4.26× against an already warm Game prompt. Including that transition, all five final pairs cost 1.86×. These are observations, not a general parity claim or a measured reduction from the previously established 3× baseline.

## Revisions and integration

- Villages staging base: `9251988b00ec3ebaf743d4337d30cb4e71d1f0f1`.
- Engine staging: `27805040eed0d91d4ea7b49f478b0b197b13676d`, version 2.5.2, Capability API 1.818. The exact unmodified staging source was built into the isolated Linux runtime; the default runtime pin and personal installations were unchanged.
- Measured final product source: `485e7214b810ba28d74af06904be796cda9c3b02`.
- Measured archive SHA-256: `fe904498414b77d30a7d62a7b841748ea66571f38c7ba51d05c4d7ab696f0d96`.

The API requirement and generated public declaration closure are in [#458](https://github.com/DSBwizzard/marinara-villages-agent/pull/458). Stable authored prompt prefixes and request/cache accounting are in [#459](https://github.com/DSBwizzard/marinara-villages-agent/pull/459). The coupled Scene contract, native consequences, context selection, retirement and measurement harnesses are in [#460](https://github.com/DSBwizzard/marinara-villages-agent/pull/460). Source merging and runtime deployment remain separate outcomes.

## Actual provider usage

All final pairs used the saved `deepseek-flash` connection through the native Engine Game and Villages HTTP paths. The stored synthetic Mara card and player inputs matched; each mode generated its own continuing history. Background work and images were disabled in the isolated world. Saved model and reasoning settings were preserved. There were no contract failures, consequential application failures, replacement requests or replay purchases in these pairs.

Each cell below gives Villages / Game Mode. Reasoning is already included in output totals and is charged once. Cache writes were unreported, not zero. Costs use provider-reported tokens multiplied by the published rate, rather than invoice amounts.

| Final pair | Input tokens | Cache reads | Output tokens | Reasoning tokens | Rated USD | Latency seconds | Cost ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Changed-prefix warmup | 10,848 / 8,106 | 2,688 / 7,424 | 631 / 422 | 45 / 36 | .001610664 / .000377772 | 8.30 / 5.80 | 4.26× |
| Ordinary patience | 11,741 / 8,509 | 10,240 / 7,680 | 889 / 644 | 245 / 319 | .000789270 / .000533790 | 9.83 / 7.68 | 1.48× |
| Ordinary craft | 12,781 / 8,851 | 11,136 / 8,192 | 501 / 578 | 84 / 150 | .000580758 / .000470226 | 6.69 / 7.02 | 1.24× |
| Corrected-Memory recall | 13,481 / 9,298 | 12,160 / 8,448 | 349 / 355 | 66 / 107 | .000444030 / .000365844 | 4.97 / 4.60 | 1.21× |
| New remembered information | 13,991 / 9,579 | 12,800 / 8,960 | 746 / 548 | 280 / 236 | .000664650 / .000448530 | 7.27 / 6.16 | 1.48× |

The final pairs ran after 10:00 UTC on 2026-11-09 at Flash off-peak rates per million tokens: $0.15 uncached input, $0.003 cached input and $0.60 output. Earlier recorded iterations used the then-applicable peak rates, twice those amounts. See [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/). Absolute dollar changes across this boundary do not demonstrate a product improvement.

[The machine-readable measurements](scene-cost-results.json) retain all 36 reported requests across six sample files, including cold prefixes, expensive Memory interpretation and intermediate layouts. No intermediate attempt has been removed from the spend total. Provider-internal HTTP retries are not exposed by the public Engine APIs. The tracked Village capability attempts and Game request counts are the observable request accounting; unknown billing must never be treated as free.

## What improved and what remains

Stable rules, complete authored cards/world/player context and a captured Scene reference precede appendable chronological witnessed history. Current time, Memory, social and Project context and presentation follow it. Three public cache breakpoints are retained through fitting and replay. The growing history message has no explicit breakpoint: block-oriented providers cannot reuse part of a changing block as though it were immutable. DeepSeek cache reads above establish actual automatic-prefix reuse for this sample; no live explicit-cache provider was tested. Cache TTL was not overridden.

History has one model representation and no independent fixed rolling window. Only actual model context pressure prunes optional complete rows in bounded batches; latest exchanges, identities and exact input remain whole. Shared wire defaults remove repeated audience/visibility fields without changing canonical evidence. Cast changes rebuild privacy projections. Full server evidence is frozen with the fitted messages; retries cannot acquire new sources or buy a replacement merely to apply an existing response.

Native Memories retain individual knowers, reports versus observations, exact accepted support and Forget/Correct protection. The live test created a private report, corrected its subject from grandmother to great-aunt without losing its root lineage, recalled the correction after a package restart, and recorded a second report about a blue kettle. Mixed private thought and speech retained the exact original submission while only “The bench looks well cared for.” acquired Mara as a witness. These checks establish those particular outcomes, not general semantic reliability.

Current Wishes remain compact characterization context, with complete relevant conditions and history before fulfillment judgments. Project terms are narrowed conservatively; approval, builder willingness, conditions, refusal, withdrawal and Start remain distinct. Relationships retain directional qualitative perspectives and authoritative agreements. Standalone social intentions and duplicate Scene disclosure proposals are retired. The old all-input classification and domain transaction model contract are replaced by sparse source selections/events. Existing native domain validators remain authoritative. Village format 17 and relationship contract 4 reject older saves without migration.

Remaining cost comes from complete source metadata on newly appended history, current authoritative context, JSON/output structure, natural differences in prose and provider reasoning. In the three final warm non-creation pairs, Villages used 38,003 input tokens versus 26,658, including 33,536 versus 24,320 cached tokens; output was 1,739 versus 1,577 and reasoning 395 versus 576. More prompt text does not necessarily imply greater cost when cached; output variance still matters. The earlier explicit Memory creation and correction were more expensive than the final new-Memory case, so one inexpensive consequence does not establish a universal 1.5× ceiling.

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

Review consequences and captured identities alongside usage. The deterministic inventory covers privacy, exact repeated/Unicode input, source validation, full Wish conditions, Project/access authority, repairs, real time, cancellation, concurrency and replay. It cannot prove that a provider always recognizes fictional meaning correctly. Native Windows full Engine client compilation was not established locally; the exact Linux staging runtime and Villages Linux/Windows CI provide the recorded integration and platform evidence.
