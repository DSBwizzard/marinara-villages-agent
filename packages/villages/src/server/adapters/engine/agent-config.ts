import { requireHost } from "./runtime-host.js";

export async function villagesAgentConnectionId(): Promise<string | null> {
  try {
    const config = await requireHost().getAgentConfig();
    return config?.connectionId ?? null;
  } catch {
    // An unreadable agent config is not fatal: the model host still has the
    // agent and engine defaults to fall through to.
    return null;
  }
}

export async function villagesAgentImageConnectionId(): Promise<string | null> {
  try {
    const config = await requireHost().getAgentConfig();
    const value = config?.settings?.imageConnectionId;
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}
