# Activation dispatch ownership

Production activation owns an asynchronous dispatch scope and host-backed connection factory. Scene queries, relationship coordination, Village state, Venue/Zone services select that owner's registrations. Actual registered handlers, plugin execution, cleanup and self-check retain the owner across asynchronous work. A missing or disposed scoped owner never falls back to another activation. Runtime epochs remain unique while active and become null after release.

Runtime and host-backed service configuration require an explicit active owner. Each registration has its own cleanup token, even when the same service object is registered repeatedly. Bound functions preserve synchronous results, thrown errors and their receiver. Pure factories can still use explicitly supplied ports without a host.

There is no global default activation or unowned host-backed fallback. The provider-free regression launcher owns its dispatch scope and host-free operation contexts, awaits suite completion and disposes that scope afterward. Captured callbacks keep their originating owner when another activation is running.

Cleanup retains its established admission and reverse disposal order, attempts every disposer, and shares one Promise across repeated/concurrent/reentrant stop calls. The dispatch scope is disposed after cleanup, including error paths. Injected lifecycle-test ports retain their existing identities and order.

Synthetic-host tests exercise interleaved storage/services/epochs and actual Fastify handlers from the default assembly; existing privacy and lifecycle regressions remain applicable. These are not actual Engine tests.

Background tickets, Scene navigation/greetings, preparation and caches use owned factories with shared backend publication fences. Scheduler shutdown does not itself await an already running reconciliation; dispatch isolation does not establish that separate drain guarantee.
