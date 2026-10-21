import { setState } from "../store";
import type { ToolDef } from "./types";

export const startTimer: ToolDef = {
  name: "start_timer",
  description: "Start a kitchen timer with a label and a duration in minutes.",
  inputSchema: {
    type: "object",
    properties: {
      label: { type: "string", description: "What the timer is for, e.g. 'pasta'" },
      minutes: { type: "number", description: "Duration in minutes" },
    },
    required: ["label", "minutes"],
  },
  handler: (a) => {
    const minutes = Number(a.minutes);
    if (!(minutes > 0)) throw new Error("minutes must be greater than 0");
    const label = String(a.label ?? "Timer");
    const timer = { id: crypto.randomUUID(), label, endsAt: Date.now() + minutes * 60_000 };
    setState((s) => ({ timers: [...s.timers, timer] }));
    return { id: timer.id, label, minutes };
  },
};