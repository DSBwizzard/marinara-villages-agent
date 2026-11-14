import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../../adapters/engine/runtime-host.js";
import { mutateDocument } from "../../adapters/storage/document-store.js";
import { activityMoments } from "../../domain/rules/activity-followup.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import { readKeepsakes } from "../../domain/rules/mailbox-view.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { generateVillageImage } from "../media/image-generation.js";
import { readVillageState } from "../world/village-store.js";

type Artwork = { image: string };
const inFlight = new WeakMap<ReturnType<typeof villagesDocuments>, Map<string, Promise<Artwork>>>();
const slot = {
  kind: "keepsake-art",
  name: "Keepsake illustration",
  description: "A private image attached to a read Activity letter.",
  coerce(value: unknown) {
    const image = (value as { image?: unknown } | undefined)?.image;
    return { image: typeof image === "string" && /^data:image\/(png|jpeg|webp);base64,/i.test(image) ? image : "" };
  },
  label: () => "Keepsake illustration",
};

export async function keepsakeArt(scope: string, id: string, generate: boolean) {
  async function authorized() {
    const state = await readVillageState({ memories: true });
    if (villageWorldScope(state) !== scope) throw conflict("The Village changed. Open Keepsakes again.");
    const gift = readKeepsakes(state).find((row) => row.id === id);
    if (!gift) throw notFound("Open the letter to see its Keepsake.");
    return state.residentPlans.activities![id];
  }
  const activity = await authorized();
  const key = "villages-keepsake-" + memoryHash([scope, id]);
  const documents = villagesDocuments();
  let jobs = inFlight.get(documents);
  if (!jobs) inFlight.set(documents, (jobs = new Map()));
  const existing = await documents.getById(VILLAGES_PACKAGE_ID, key);
  if (existing && existing.kind !== slot.kind) throw conflict("The saved illustration is unavailable.");
  const stored = slot.coerce(existing?.data);
  if (stored.image || !generate) return stored;
  const running = jobs.get(key);
  if (running) return running;
  const task = (async () => {
    async function promptForCurrentMoment() {
      const current = await authorized();
      const state = await readVillageState({ memories: true });
      if (villageWorldScope(state) !== scope || current.keepsake?.moment !== activity.keepsake?.moment)
        throw conflict("The Keepsake changed.");
      const moment = activityMoments(state, current).find((row) => row.id === current.keepsake?.moment);
      if (!moment) throw conflict("That moment is no longer available to illustrate.");
      return (
        "Create a storybook illustration of this moment shared by the player and the Villager. Use visual imagery without dialogue or captions.\n" +
        moment.text
      );
    }
    const prompt = await promptForCurrentMoment();
    const result = await generateVillageImage({
      name: "Keepsake",
      prompt,
      width: 768,
      height: 768,
      maxBase64Length: 1_500_000,
      beforeDispatch: async () => {
        if ((await promptForCurrentMoment()) !== prompt) throw conflict("The Keepsake changed before illustration.");
      },
    });
    if ((await promptForCurrentMoment()) !== prompt) throw conflict("The Keepsake changed during illustration.");
    const image = slot.coerce({ image: result.dataUrl }).image;
    if (!image) throw conflict("The illustration format could not be saved.");
    await mutateDocument(key, slot, (value) => {
      if (!value.image) value.image = image;
    });
    return { image };
  })();
  jobs.set(key, task);
  try {
    return await task;
  } finally {
    jobs.delete(key);
  }
}
