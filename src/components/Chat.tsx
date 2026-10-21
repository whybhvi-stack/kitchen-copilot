import { useEffect, useRef } from "react";
import { sendMessage } from "../assistant";
import { addMessage, getState, setState, useStore } from "../store";
import { listenOnce, stopSpeaking, voiceSupported } from "../voice";

const SUGGESTIONS = [
  "What's expiring soon?",
  "What can I cook in 20 minutes?",
  "Start a 10 minute timer for pasta",
];

export default function Chat() {
  const messages = useStore((s) => s.messages);
  const draft = useStore((s) => s.draft);
  const busy = useStore((s) => s.busy);
  const listening = useStore((s) => s.listening);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function toggleMic() {
    if (getState().listening) {
      stopRef.current?.();
      return;
    }
    stopSpeaking();
    setState(() => ({ listening: true }));
    stopRef.current = listenOnce({
      onText: (t) => { void sendMessage(t); },
      onError: (m) => addMessage("system", m),
      onEnd: () => setState(() => ({ listening: false })),
    });
  }

  const bubble = (role: string) =>
    role === "user" ? "bg-amber-500 text-stone-950"
    : role === "system" ? "border border-red-500/40 bg-red-500/10 text-red-200"
    : "bg-stone-800 text-stone-100";

  return (
    <section aria-label="Conversation" className="flex h-[75vh] min-h-0 flex-col rounded-xl border border-stone-800 bg-stone-900 lg:h-auto">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <p className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${bubble(m.role)}`}>
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="animate-pulse text-sm text-stone-400">Kitchen Copilot is thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-800 p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" disabled={busy} onClick={() => void sendMessage(s)}
              className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-300 hover:bg-stone-800 disabled:opacity-40">
              {s}
            </button>
          ))}
        </div>
        <form className="flex items-center gap-3" onSubmit={(e) => { e.preventDefault(); void sendMessage(draft); }}>
          <button type="button" onClick={toggleMic} disabled={!voiceSupported || (busy && !listening)}
            aria-label={listening ? "Stop listening" : "Start listening"}
            className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full text-2xl transition disabled:opacity-40 ${listening ? "bg-red-500" : "bg-amber-500 text-stone-950 hover:bg-amber-400"}`}>
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/60" />}
            <span className="relative">🎤</span>
          </button>
          <input aria-label="Message" value={draft} disabled={busy}
            onChange={(e) => setState(() => ({ draft: e.target.value }))}
            placeholder="Type or tap the mic…"
            className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm outline-none focus:border-amber-500 disabled:opacity-60" />
          <button type="submit" disabled={busy || !draft.trim()}
            className="rounded-lg bg-stone-700 px-4 py-2 text-sm font-medium hover:bg-stone-600 disabled:opacity-40">
            Send
          </button>
        </form>
        <p className="mt-2 text-xs text-stone-500">
          {!voiceSupported ? "Voice input needs Chrome or Edge. You can type instead." : listening ? "Listening…" : "Tap the mic and speak, or type."}
        </p>
      </div>
    </section>
  );
}