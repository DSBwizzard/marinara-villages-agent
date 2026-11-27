# Scene response recovery

New ordinary Scene replies use tagged prose and separate records for optional effects. Plain narration can stand on its own. When a proposed effect fails, the server can keep independent playable prose and withhold any lines that depend on the effect.

Scene operations with a JSON contract still need one complete object and a normal finish. Bounded punctuation recovery runs before schema, source, witness, and effect validation. See [model JSON recovery](model-json-recovery.md).

## Failed replies and Retry

New player chat and contact turns save the submitted request identity and draft. The fitted prompt and provider completion stay in memory. A failed reply leaves no model prose or inferred effects in the story. After a failed chat reply, the composer restores unsaved input if the player has made no newer edits. Send checks whether the prior attempt committed and requests a fresh reply when it did not. Each dispatch uses the selected connection once.

An accepted Episode and its effects commit together in the Village. A compact Scene record binds that commit to the admitted world, turn and input. If the server stops before it commits, the player can retry. If it stops after the commit, Villages publishes the saved Episode without buying another reply or applying effects twice.

A dropped browser connection can leave the server working. The client checks the exact request and saved reply with bounded reads. A duplicate request cannot buy or publish a second reply. Stop and Scene revision checks fence late results.

## Lost turn connections

If the browser loses its connection, the server can still finish the turn. Villages checks the exact submitted text and ID, then refreshes the Scene when a committed reply becomes available. If Villages cannot confirm the reply, it restores the text without overwriting newer edits. A later Send checks the original ID. When the server has no receipt, Send reuses that ID so the delayed original and the new submission cannot both publish.

The latest saved submission can establish publication even after its reply leaves the visible playback page or a later action replaces the operation. The client reconciles against that record and keeps the reading position when it displays a late reply.

Legacy retained requests still use their original evidence to establish what committed. A saved turn with a compatible retry record can retain its alternate-reply control. Openings, departure and automatic events have their own admission and recovery contracts.

## Hearing evidence and citations

Current nonverbal sounds use metadata on an ordinary narration segment. Full narration stays local; remote listeners receive only the permitted audible cue through soundOnly under the same line ID. Raised voices likewise distinguish heard words from indistinct sound. Routing creates no extra evidence line and grants no unseen visuals, attendance, access or movement.

Consequential input citations bind exact excerpts and, when necessary, their occurrence. The submitted text establishes the source. Code checks the claimed communication or perception against captured positions and eligible witnesses. The full input remains private GM chronology with an empty resident audience. An explicit reminder captures its recipient as part of the request identity. Its verified source is a whisper at the start of the exchange. Generated segment labels and fitted source references bind accepted effects to the evidence the GM actually received.

Ordinary responses omit private provider evidence and request checkpoints. Copy Discord report includes the package version, action, route template, HTTP result, elapsed time, failure phase and available recovery state. Validator details use recognized codes, schema paths and expected types. The report excludes player and place names, identifiers, dialogue, raw errors and provider details. Copying starts no server requests or recovery actions. The Changes evidence panel reads its own scoped diagnostics.

## Response timings and validation

Replies remain checked before display. Private diagnostics retain bounded server timings, checkpoint reuse and provider metrics. Nested spans must not be added as if independent elapsed times. The browser keeps at most twenty send-origin timing records containing IDs and durations; they clear with the tab. History reads do not create send timings.

Provider-free tests cover complete JSON handling, bounded diagnostics, exact sources, private hearing, explicit replacement, lost acknowledgements and saved-response replay. Those checks do not establish provider conformance, semantic quality, latency improvements or cost savings.
