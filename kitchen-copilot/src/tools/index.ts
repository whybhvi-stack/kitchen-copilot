import type { FunctionDeclaration } from "@google/genai";
import { setState } from "../store";
import type { ToolCallLog } from "../types";
import { addPantryItem, getExpiringItems, getPantry } from "./pantry";
import { getRecipeSteps, suggestRecipes } from "./recipes";
import { addToShoppingList, getShoppingList } from "./shopping";
import { startTimer } from "./timers";
import type { JsonSchema, ToolDef } from "./types";

export const tools: ToolDef[] = [
  getPantry,
  addPantryItem,
  suggestRecipes,
  getRecipeSteps,
  addToShoppingList,
  getShoppingList,
  startTimer,
  getExpiringItems,
];

const registry = new Map(tools.map((t) => [t.name, t]));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callTool(name: string, args: Record<string, unknown>) {
  const id = crypto.randomUUID();
  const started = performance.now();
  setState((s) => ({
    toolCalls: [{ id, name, input: args, status: "running", at: Date.now() }, ...s.toolCalls],
  }));

  await sleep(300);

  let ok = true;
  let output: unknown;
  try {
    const tool = registry.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    output = await tool.handler(args);
  } catch (e) {
    ok = false;
    output = { error: e instanceof Error ? e.message : String(e) };
  }

  const durationMs = Math.round(performance.now() - started);
  setState((s) => ({
    toolCalls: s.toolCalls.map((c) =>
      c.id === id
        ? { ...c, output, ok, durationMs, status: (ok ? "done" : "error") as ToolCallLog["status"] }
        : c,
    ),
  }));
  return { ok, output, durationMs };
}

const toGeminiSchema = (s: JsonSchema): Record<string, unknown> => ({
  ...s,
  type: s.type.toUpperCase(),
  ...(s.properties && {
    properties: Object.fromEntries(
      Object.entries(s.properties).map(([k, v]) => [k, toGeminiSchema(v)]),
    ),
  }),
  ...(s.items && { items: toGeminiSchema(s.items) }),
});

export const geminiDeclarations = (): FunctionDeclaration[] =>
  tools.map((t) => {
    const hasParams = t.inputSchema.properties && Object.keys(t.inputSchema.properties).length > 0;
    return {
      name: t.name,
      description: t.description,
      ...(hasParams && {
        parameters: toGeminiSchema(t.inputSchema) as unknown as FunctionDeclaration["parameters"],
      }),
    };
  });