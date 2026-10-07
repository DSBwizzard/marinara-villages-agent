# Activation dispatch ownership

Previously, runtime and service lookup selected module-wide current bindings. An asynchronous request or old self-check could resume after replacement configuration and read the replacement's storage or feature services. Entry ownership and guarded cleanup alone did not pin those later lookups.

Production activation now owns an asynchronous dispatch scope and host-backed connection factory. Scene queries, relationship coordination, Village state, Venue/Zone services and Decisions select that owner's registrations. Actual registered handlers, plugin execution, cleanup and self-check retain the owner across asynchronous work. A missing or disposed scoped owner never falls back to another activation. Runtime epochs remain unique while active and become null after release.

Direct configuration remains synchronous for existing callers and provider-free tests. It selects one legacy default; replacing that default invalidates the old host epoch, preserving existing replacement fences. Standalone service configuration still works without a host. Each registration has its own cleanup token, even when the same service object is registered repeatedly. Bound functions preserve synchronous results, thrown errors and their receiver.

Cleanup retains its established admission and reverse disposal order, attempts every disposer, and shares one Promise across repeated/concurrent/reentrant stop calls. The dispatch scope is disposed after cleanup, including error paths. Injected lifecycle-test ports retain their existing identities and order.

This correction changes connection selection during overlap, not routes, request identifiers, saved formats, Scene attendance or model budgets/retries. Synthetic-host tests exercise interleaved storage/services/epochs and actual Fastify handlers from the default assembly; existing privacy and lifecycle regressions remain applicable. These are not actual Engine tests.

Global queue/caching implementations still require owned factories. Dispatch scoping alone does not establish isolation of background tickets, Scene navigation/greetings, preparation or caches, and does not fix the separate reconciliation-drain gap. Those remain open in the architecture ledger.
