import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { SpriteManager } from "./sprite-manager-service.js";
export type { SpriteManager } from "./sprite-manager-service.js";
export { spritePng } from "./sprite-image-codec.js";
const binding = createActivationBinding<SpriteManager>("Sprite Manager is not configured.");
export function configureSpriteManager(service: SpriteManager): () => void {
  return binding.configure(bindActivationService(service));
}
export function spriteManager(): SpriteManager {
  return binding.get();
}
export async function readSpriteManager(...args: Parameters<SpriteManager["readSpriteManager"]>) {
  return spriteManager().readSpriteManager(...args);
}
export function importSpriteArtwork(...args: Parameters<SpriteManager["importSpriteArtwork"]>) {
  return spriteManager().importSpriteArtwork(...args);
}
export async function listSpriteLibrary(...args: Parameters<SpriteManager["listSpriteLibrary"]>) {
  return spriteManager().listSpriteLibrary(...args);
}
export function adoptSpriteArtwork(...args: Parameters<SpriteManager["adoptSpriteArtwork"]>) {
  return spriteManager().adoptSpriteArtwork(...args);
}
export function saveSpriteArtwork(...args: Parameters<SpriteManager["saveSpriteArtwork"]>) {
  return spriteManager().saveSpriteArtwork(...args);
}
export function setSpriteDefault(...args: Parameters<SpriteManager["setSpriteDefault"]>) {
  return spriteManager().setSpriteDefault(...args);
}
export function setSpriteFraming(...args: Parameters<SpriteManager["setSpriteFraming"]>) {
  return spriteManager().setSpriteFraming(...args);
}
export function removeSpriteAssignment(...args: Parameters<SpriteManager["removeSpriteAssignment"]>) {
  return spriteManager().removeSpriteAssignment(...args);
}
export function removeSpriteArtwork(...args: Parameters<SpriteManager["removeSpriteArtwork"]>) {
  return spriteManager().removeSpriteArtwork(...args);
}
export async function decodeSpriteImage(...args: Parameters<SpriteManager["decodeSpriteImage"]>) {
  return spriteManager().decodeSpriteImage(...args);
}
