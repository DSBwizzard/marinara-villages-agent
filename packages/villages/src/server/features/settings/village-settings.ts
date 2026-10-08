import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageSettings } from "./village-settings-service.js";
export type { VillageSettings } from "./village-settings-service.js";
const binding = createActivationBinding<VillageSettings>("Villages settings are not configured.");
export function configureVillageSettings(service: VillageSettings): () => void {
  return binding.configure(bindActivationService(service));
}
export function villageSettings(): VillageSettings {
  return binding.get();
}
export function setVillagePromptKnowledge(...args: Parameters<VillageSettings["setVillagePromptKnowledge"]>) {
  return villageSettings().setVillagePromptKnowledge(...args);
}
export function setVillageLoreSettings(...args: Parameters<VillageSettings["setVillageLoreSettings"]>) {
  return villageSettings().setVillageLoreSettings(...args);
}
export function setVillageStoryPace(...args: Parameters<VillageSettings["setVillageStoryPace"]>) {
  return villageSettings().setVillageStoryPace(...args);
}
export function setVillageSpriteCardFlipEnabled(
  ...args: Parameters<VillageSettings["setVillageSpriteCardFlipEnabled"]>
) {
  return villageSettings().setVillageSpriteCardFlipEnabled(...args);
}
export function setVillageSendOnEnter(...args: Parameters<VillageSettings["setVillageSendOnEnter"]>) {
  return villageSettings().setVillageSendOnEnter(...args);
}
export function setVillageCharacterSpeechColors(
  ...args: Parameters<VillageSettings["setVillageCharacterSpeechColors"]>
) {
  return villageSettings().setVillageCharacterSpeechColors(...args);
}
export function setVillageName(...args: Parameters<VillageSettings["setVillageName"]>) {
  return villageSettings().setVillageName(...args);
}
export function setVillagePlayer(...args: Parameters<VillageSettings["setVillagePlayer"]>) {
  return villageSettings().setVillagePlayer(...args);
}
export function setVillageSetting(...args: Parameters<VillageSettings["setVillageSetting"]>) {
  return villageSettings().setVillageSetting(...args);
}
export function addNotice(...args: Parameters<VillageSettings["addNotice"]>) {
  return villageSettings().addNotice(...args);
}
export function removeNoticeAt(...args: Parameters<VillageSettings["removeNoticeAt"]>) {
  return villageSettings().removeNoticeAt(...args);
}
export function setScenerySettings(...args: Parameters<VillageSettings["setScenerySettings"]>) {
  return villageSettings().setScenerySettings(...args);
}
