import { fail, readChatId } from "../../adapters/http/route-support.js";
import { readChatSpinOff, readSpinOffPresetPicker, readSpinOffPresetVariables } from "./spinoff.js";
import type { FastifyInstance } from "fastify";

export function registerSpinOffRoutes(engine: FastifyInstance) {
  const app = engine;
  app.get("/spinoffs/prompts", async (_request, reply) => {
    try {
      return await readSpinOffPresetPicker();
    } catch (error) {
      return fail(reply, error, "reading the presets a spin-off could run on");
    }
  });
  app.get<{ Params: { presetId: string } }>("/presets/:presetId/variables", async (request, reply) => {
    try {
      return await readSpinOffPresetVariables(request.params.presetId);
    } catch (error) {
      return fail(reply, error, "reading a preset's questions");
    }
  });
  app.get<{ Params: { chatId: string } }>("/spinoffs/:chatId", async (request, reply) => {
    try {
      return await readChatSpinOff(readChatId(request.params.chatId));
    } catch (error) {
      return fail(reply, error, "reading where a roleplay came from");
    }
  });
}
