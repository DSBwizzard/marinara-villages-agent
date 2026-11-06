# Activation cleanup

Every successfully acquired disposer is registered inside the activation failure handler. Shutdown runs disposers once, in reverse acquisition order, and attempts the remaining cleanup if one fails. Concurrent, repeated and reentrant shutdown calls share the same result. Failed Scene recovery also stops its coordinator; an older disposer clears only its own registration.

An activation failure remains the primary error. If cleanup also fails, the aggregate contains the activation failure first, followed by the cleanup failures. Failed disposers are not silently retried. An acquisition must undo its internal partial setup before throwing if it has not returned a disposer.

Activation owns its queues, cancellation scope, services and host registrations. Cleanup preserves saved work, exact request identities and the existing model budgets and retry rules. See [dispatch ownership](activation-dispatch-ownership.md).

Provider-free tests exercise the actual application assembly with synthetic service ports, admission failures, throwing cleanup, repeated/concurrent shutdown and entry ownership. Packaged Engine verification remains separate.
