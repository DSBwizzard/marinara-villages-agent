# Scene response privacy correction

This correction is separate from the architecture's mechanical route extraction.

Today, the registered active-Scene and archive handlers return saved Scene records. Their wrapper reduces operation and relationship-review details but retains whole-Venue attendance, checkpoints and internal evidence. The previous Zone regression checked an unused legacy wrapper, so it did not prove privacy at the actual route boundary.

Afterward, the existing Scene projection runs on the `session` and `visit` fields returned through the active collector. It omits internal attendance, hidden contact lines and recovery/provider evidence while keeping visible participants, transcript, progress status and operation summaries. Other payloads and explicit owner diagnostics retain their existing handling. The obsolete scene lock stays inactive.

The benefit is enforcing the intended server-only Zone boundary in actual API responses. Saved worlds, identifiers, attendance capture, controls and request/retry/budget behavior are unchanged. Existing worlds need no migration. Projection performs no model request and does not mutate stored records. Clients relying on these undocumented private fields will no longer receive them.

Validation invokes the actual registered active and archived Scene handlers in the Zone fixture, checks hidden contents and saved-state preservation, and confirms no extra mocked provider calls. Separate projection regressions exercise nested checkpoints and contact witnesses. Actual packaged verification remains required before claiming the migration complete.
