import { GoogleGenAI } from "@google/genai";
import type { Content, Part } from "@google/genai";
import { callTool, geminiDeclarations } from "../tools";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.5-flash";
// Optional backup model, used if the main one stays busy.
const FALLBACK_MODEL = (import.meta.env.VITE_GEMINI_FALLBACK_MODEL as string | undefined) || "";

const SYSTEM = `You are Kitchen Copilot, a friendly voice assistant for a kitchen and grocery brand. You simulate an Alexa+ experience.

Rules:
- Reply in 1 to 3 short, natural spoken sentences. No markdown, no lists, no emojis.
- Use tools for every fact about the pantry, recipes, shopping list or timers. Never invent pantry items, recipes or quantities.
- For multi-part requests, call the tools you need in order, then give one combined answer.
- If items are close to expiring, proactively offer a recipe that uses them.
- If a request is ambiguous, ask one short clarifying question.
- Only add a quantity to the shopping list if the user stated one.`;

// Conversation memory for the session (includes tool calls and results).
let history: Content[] = [];

export const resetConversation = () => {
  history = [];
};

type GenerateParams = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Retry on temporary errors (429 rate limit, 503 busy). After the first failure,
// switch to the backup model if one is set in .env.
async function generateWithRetry(ai: GoogleGenAI, params: GenerateParams) {
  let model = params.model;
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const retryable = /\b(429|503)\b|RESOURCE_EXHAUSTED|UNAVAILABLE/.test(msg);
      if (!retryable || attempt >= 4) throw e;
      if (attempt >= 1 && FALLBACK_MODEL) model = FALLBACK_MODEL;
      await sleep(2000 * (attempt + 1)); // waits 2s, 4s, 6s, 8s
    }
  }
}

export async function runAgent(userText: string): Promise<string> {
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Copy .env.example to .env and add your key.");
  }
  const ai = new GoogleGenAI({ apiKey });
  history.push({ role: "user", parts: [{ text: userText }] });

  // Allow several tool-calling rounds for multi-step requests.
  for (let step = 0; step < 6; step++) {
    const res = await generateWithRetry(ai, {
      model: MODEL,
      contents: history,
      config: {
        systemInstruction: SYSTEM,
        tools: [{ functionDeclarations: geminiDeclarations() }],
      },
    });

    // Keep the model turn exactly as returned (preserves any thought signatures).
    const modelContent = res.candidates?.[0]?.content;
    if (modelContent) history.push(modelContent);

    const calls = res.functionCalls ?? [];
    if (calls.length === 0) return res.text ?? "Sorry, I didn't catch that.";

    // Run sequentially so the Tool Calls panel shows them in order.
    const parts: Part[] = [];
    for (const c of calls) {
      const name = c.name ?? "";
      const r = await callTool(name, (c.args ?? {}) as Record<string, unknown>);
      parts.push({
        functionResponse: { name, response: r.ok ? { output: r.output } : { error: r.output } },
      });
    }
    history.push({ role: "user", parts });
  }
  return "That took too many steps. Could you try a simpler request?";
}