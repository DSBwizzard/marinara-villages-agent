# Decisions capability ownership

Each activation captures the optional public `api.runtime.decisions` receiver. Calls preserve that receiver, request, operation signal and originating owner across awaits. Disposed instances reject before dispatch and after a late response; old cleanup cannot replace or clear a newer activation's adapter. Status checks only inspect capability presence and never probe model configuration.

The private database/module loader and build whitelist have been removed. The public API from Engine PR #7369 owns model selection, credential resolution, provider transport, calibration and timeouts. A missing capability or null answer uses the existing System path.

Scene operations and background jobs own cancellation and durable optional-attempt receipts. Background attempts use a separate `optionalAttempts` journal rather than required System completion steps. Reservation precedes dispatch; the cumulative allowance is ten seconds. Completed attempts replay, uncertain attempts require explicit recovery and are never automatically repeated. System checkpoints purchased before the optional path retain precedence.

Provider-free adapter regressions cover feature detection, receiver identity, null model metadata, pre/post-response cancellation, overlapping activation dispatch and disposal. The Engine-dependent transport test requires an existing post-PR built runtime and a synthetic local provider. Mocked checks do not establish packaged gameplay accuracy.
