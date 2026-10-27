import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { RepairService } from "./repair-service.js";
const binding = createActivationBinding<RepairService>("REPAIR is unavailable.");
export const configureRepairs = (service: RepairService) => binding.configure(bindActivationService(service));
export const repairs = () => binding.get();
