import { resetConversation, runAgent } from "./agent/agent";
import { seedPantry } from "./data/pantry";
import { addMessage, getState, makeGreeting, setState } from "./store";
import { speak, stopSpeaking } from "./voice";

function friendlyError(e: unknown): string {
  console.error(e);
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes("VITE_GEMINI_API_KEY")) {
    return "I can't reach Gemini yet. Add your API key to the .env file and restart the dev server.";
  }
  if (msg.includes("429") || /quota|rate/i.test(msg)) {
    return "I've hit Gemini's rate limit. Wait a moment and try again.";
  }
  if (msg.includes("404") || /not found/i.test(msg)) {
    return "Gemini couldn't find that model. Check VITE_GEMINI_MODEL in your .env file.";
  }
  if (msg.includes("401") || msg.includes("403") || /api key/i.test(msg)) {
    return "Gemini rejected the API key. Check it in your .env file.";
  }
  return "Something went wrong talking to Gemini. Please try again.";
}

/** Send a user message through the agent. Resolves with the reply (null on failure). */
export async function sendMessage(text: string): Promise<string | null> {
  const clean = text.trim();
  if (!clean || getState().busy) return null;

  stopSpeaking();
  addMessage("user", clean);
  setState(() => ({ busy: true, draft: "" }));

  let reply: string | null = null;
  try {
    reply = await runAgent(clean);
    addMessage("assistant", reply);
  } catch (e) {
    addMessage("system", friendlyError(e));
  } finally {
    setState(() => ({ busy: false }));
  }

  if (reply && !getState().muted) await speak(reply);
  return reply;
}

/** Reset everything to the starting state (used before the demo). */
export function resetSession() {
  resetConversation();
  stopSpeaking();
  setState(() => ({
    pantry: seedPantry(),
    shopping: [],
    timers: [],
    toolCalls: [],
    messages: [makeGreeting()],
    draft: "",
    busy: false,
    listening: false,
  }));
}