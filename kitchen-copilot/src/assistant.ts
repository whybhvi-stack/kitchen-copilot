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
  if (/\b404\b|NOT_FOUND/.test(msg)) {
    return "Gemini couldn't find that model. Check VITE_GEMINI_MODEL in your .env file.";
  }
  if (/\b(401|403)\b|PERMISSION_DENIED|UNAUTHENTICATED|API_KEY_INVALID|API key not valid/i.test(msg)) {
    return "Gemini rejected the API key. Check it in your .env file.";
  }
  if (/\b429\b|RESOURCE_EXHAUSTED|quota|rate limit/i.test(msg)) {
    return "I've hit Gemini's usage limit. Wait a minute and try again.";
  }
    if (/\b503\b|UNAVAILABLE/.test(msg)) {
    return "Gemini is very busy right now. Please try again in a minute.";
  }
  return `Gemini error: ${msg.slice(0, 300)}`;
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