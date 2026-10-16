# Scene response privacy correction

This correction is separate from the architecture's mechanical route extraction.

Today, the registered active-Scene and archive handlers return saved Scene records. Their wrapper reduces operation and relationship-review details but retains whole-Venue attendance, checkpoints and internal evidence. The previous Zone regression checked an unused legacy wrapper, so it did not prove privacy at the actual route boundary.

Afterward, the existing Scene projection runs on the `session` and `visit` fields returned through the active collector. It omits internal attendance, hidden contact lines and recovery/provider evidence while keeping visible participants, transcript, progress status and operation summaries. Other payloads and explicit owner diagnostics retain their existing handling. The obsolete scene lock stays inactive.

The benefit is enforcing the intended server-only Zone boundary in actual API responses. Saved worlds, identifiers, attendance capture, controls and request/retry/budget behavior are unchanged. Existing worlds need no migration. Projection performs no model request and does not mutate stored records. Clients relying on these undocumented private fields will no longer receive them.

Validation invokes the actual registered active and archived Scene handlers in the Zone fixture, checks hidden contents and saved-state preservation, and confirms no extra mocked provider calls. Separate projection regressions exercise nested checkpoints and contact witnesses. Actual packaged verification remains required before claiming the migration complete.

## Narrated sounds

New Zone responses weave nonverbal sounds into ordinary narration. An optional `sound: { sourceId, text, loud? }` on a narration segment routes its audible component using captured positions and the existing ordinary/very-loud reach rules. The paragraph remains player-observable prose; `sound.text` is an audible-only description of at most 300 characters. Source IDs are private routing data, not permission to name unseen sources in prose. One source is supported per annotated segment, evaluated after any validated movement at that segment. The player must be within sound reach.

The full narration keeps only local visual witnesses. Remote listeners receive the existing private `soundOnly` view under the same line ID, without the surrounding actions; the narration index does not give them evidence of those actions. Public responses omit routing metadata and never add a second sound paragraph. The saved representation reuses `soundOnly`, so existing scenes need no migration. Legacy standalone sound segments remain readable for recovery compatibility. No extra model call or automatic prose rewrite is introduced.
