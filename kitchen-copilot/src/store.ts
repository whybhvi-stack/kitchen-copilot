import { useSyncExternalStore } from "react";
import { seedPantry } from "./data/pantry";
import type { ChatMessage, PantryItem, ShoppingItem, Timer, ToolCallLog } from "./types";

export interface AppState {
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  timers: Timer[];
  toolCalls: ToolCallLog[]; // newest first
  messages: ChatMessage[];
  draft: string;
  busy: boolean;
  muted: boolean;
  listening: boolean;
  demoRunning: boolean;
  demoCaption: string;
}

export const makeGreeting = (): ChatMessage => ({
  id: crypto.randomUUID(),
  role: "assistant",
  text: "Hi, I'm Kitchen Copilot. Ask me what you can cook, or what's about to expire.",
});

let state: AppState = {
  pantry: seedPantry(),
  shopping: [],
  timers: [],
  toolCalls: [],
  messages: [makeGreeting()],
  draft: "",
  busy: false,
  muted: false,
  listening: false,
  demoRunning: false,
  demoCaption: "",
};

const listeners = new Set<() => void>();

export const getState = () => state;

export function setState(update: (s: AppState) => Partial<AppState>) {
  state = { ...state, ...update(state) };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// The selector must return a stable reference (a slice of state), not a new object.
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}

export function addMessage(role: ChatMessage["role"], text: string) {
  setState((s) => ({
    messages: [...s.messages, { id: crypto.randomUUID(), role, text }],
  }));
}