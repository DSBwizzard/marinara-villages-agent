import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { FoundingSuggestionsService } from "./founding-suggestions-service.js";
const binding = createActivationBinding<FoundingSuggestionsService>("Founding suggestions are not configured.");
export function configureFoundingSuggestions(service: FoundingSuggestionsService): () => void {
  const release = binding.configure(bindActivationService(service));
  return () => {
    service.stop();
    release();
  };
}
export function requestFoundingSuggestions(value: unknown) {
  return binding.get().requestFoundingSuggestions(value);
}
export function readFoundingSuggestions(value: unknown) {
  return binding.get().readFoundingSuggestions(value);
}
