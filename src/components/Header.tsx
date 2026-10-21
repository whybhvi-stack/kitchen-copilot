import type { ReactNode } from "react";
import { setState, useStore } from "../store";
import { stopSpeaking } from "../voice";

export default function Header({ children }: { children?: ReactNode }) {
  const muted = useStore((s) => s.muted);
  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-stone-800 bg-stone-900 px-4 py-3">
      <span className="text-2xl" aria-hidden="true">🍳</span>
      <h1 className="text-lg font-bold tracking-tight">Kitchen Copilot</h1>
      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
        Alexa+ simulation
      </span>
      <div className="ml-auto flex items-center gap-2">
        {children}
        <button
          type="button"
          aria-pressed={muted}
          onClick={() => {
            if (!muted) stopSpeaking();
            setState((s) => ({ muted: !s.muted }));
          }}
          className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          {muted ? "🔇 Muted" : "🔊 Voice on"}
        </button>
      </div>
    </header>
  );
}