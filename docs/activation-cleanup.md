# Activation cleanup correction

This is a separate reliability correction within the architecture migration. It changes failure handling; ordinary successful startup, gameplay, and shutdown order stay the same.

Today, the first three setup steps run outside the failure handler. A later setup failure can leave earlier acquired resources registered. Stopping twice reverses and runs the cleanup list twice, and one failing cleanup prevents the remaining cleanups. A Scene recovery failure can leave the coordinator running. An older activation's disposer also clears the current activation's self-check reference.

Afterward, every successfully acquired disposer is registered inside the failure handler. Shutdown runs each disposer once, in reverse acquisition order, and attempts the remaining disposers if one fails. Concurrent or repeated shutdown calls share one result. Failed Scene recovery also stops its coordinator. An older disposer clears only its own self-check reference.

When activation fails, the original error is preserved. If cleanup also fails, an aggregate error contains the activation failure first and every cleanup failure afterward. Failed disposers are not silently retried.

This improves recovery diagnostics and cleanup reliability. It does not change stored records, routes, controls, model budgets, provider requests, or automatic retry rules. Each acquisition still must undo any internal partial setup before throwing if it has not returned its disposer. Per-activation queue isolation and cancellation of already-running background work remain separate migration work; this change does not claim to solve them.

Validation exercises the actual application assembly through mocked service ports, all admission failures, throwing cleanups, repeated/concurrent shutdown, and the actual entry module with a mocked application boundary. Packaged verification is separate. Publication still requires review of the complete candidate.
