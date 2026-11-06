# Activation dispatch ownership

Production activation owns an asynchronous dispatch scope and host-backed connection factory. Scene queries, relationship coordination, Village state, Venue/Zone services select that owner's registrations. Actual registered handlers, plugin execution, cleanup and self-check retain the owner across asynchronous work. A missing or disposed scoped owner never falls back to another activation. Runtime epochs remain unique while active and become null after release.

Direct configuration remains synchronous for existing callers and provider-free tests. It selects one direct default; replacing that default invalidates the old host epoch, preserving existing replacement fences. Standalone service configuration still works without a host. Each registration has its own cleanup token, even when the same service object is registered repeatedly. Bound functions preserve synchronous results, thrown errors and their receiver.

Successful production setup also publishes its owner as the default for supported direct helpers called outside a request. This pointer does not invalidate another production owner. Failed setup never publishes it, and cleanup clears only its own registration. Explicitly scoped requests and self-checks retain their original owner regardless of that default.

Cleanup retains its established admission and reverse disposal order, attempts every disposer, and shares one Promise across repeated/concurrent/reentrant stop calls. The dispatch scope is disposed after cleanup, including error paths. Injected lifecycle-test ports retain their existing identities and order.

Synthetic-host tests exercise interleaved storage/services/epochs and actual Fastify handlers from the default assembly; existing privacy and lifecycle regressions remain applicable. These are not actual Engine tests.

Background tickets, Scene navigation/greetings, preparation and caches use owned factories with shared backend publication fences. Scheduler shutdown does not itself await an already running reconciliation; dispatch isolation does not establish that separate drain guarantee.
