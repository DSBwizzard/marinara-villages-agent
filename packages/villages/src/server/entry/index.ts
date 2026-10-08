import { type ActivationContext, startVillagesApplication } from "./application.js";

let application: Awaited<ReturnType<typeof startVillagesApplication>> | null = null;
export async function activate(context: ActivationContext) {
  const activated = await startVillagesApplication(context);
  application = activated;
  return async () => {
    if (application === activated) application = null;
    await activated.stop();
  };
}
export async function selfCheck() {
  if (!application) throw new Error("Villages routes did not activate");
  await application.selfCheck();
}
