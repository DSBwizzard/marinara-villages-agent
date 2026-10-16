import { expect } from "@playwright/test";
export async function openSceneErrors(page) {
  const trigger = page.getByRole("button", { name: /^\d+ Scene errors?$/ });
  await expect(trigger).toBeVisible();
  if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
  const panel = page.getByRole("region", { name: "Scene errors", exact: true });
  await expect(panel).toBeVisible();
  while (await panel.locator("details:not([open]) > summary").count())
    await panel.locator("details:not([open]) > summary").first().click();
  return panel;
}
export async function closeSceneErrors(page) {
  const close = page.getByRole("button", { name: "Close Scene errors", exact: true });
  if (await close.count()) await close.click();
}
export async function expectSceneError(page, text) {
  const panel = await openSceneErrors(page);
  await expect(panel).toContainText(text);
  await closeSceneErrors(page);
}
