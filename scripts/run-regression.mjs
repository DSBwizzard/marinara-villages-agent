import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createActivationScope } from "../packages/villages/src/server/adapters/engine/activation-scope.js";

import { configureVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context.js";
import { createVenueOperationContext } from "../packages/villages/src/server/adapters/operations/operation-context-service.js";
import { configureBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context.js";
import { createBackgroundContext } from "../packages/villages/src/server/adapters/operations/background-context-service.js";
import { configureMetricsContext } from "../packages/villages/src/server/adapters/observability/metrics-context.js";
import { createMetricsContext } from "../packages/villages/src/server/adapters/observability/metrics-context-service.js";
import { villagesLogger } from "../packages/villages/src/server/adapters/engine/runtime-host.js";

const owner = createActivationScope();
try {
  owner.run(() => {
    configureVenueOperationContext(createVenueOperationContext(villagesLogger));
    configureBackgroundContext(createBackgroundContext());
    configureMetricsContext(createMetricsContext());
  });
  await owner.run(() => import(pathToFileURL(resolve(process.argv[2])).href));
} finally {
  owner.dispose();
}
