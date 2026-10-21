import { useStore } from "../store";
import type { ToolCallLog } from "../types";

const json = (v: unknown) => JSON.stringify(v, null, 2);

function StatusDot({ status }: { status: ToolCallLog["status"] }) {
  const cls = status === "running" ? "animate-pulse bg-amber-400" : status === "done" ? "bg-emerald-400" : "bg-red-400";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />;
}

export default function ToolCallsPanel() {
  const calls = useStore((s) => s.toolCalls);
  return (
    <section aria-label="Tool calls" className="flex h-[75vh] min-h-0 flex-col rounded-xl border border-stone-800 bg-stone-900 lg:h-auto">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
        <h2 className="font-semibold">Tool Calls</h2>
        <span className="text-xs text-stone-400">MCP-style · {calls.length} call{calls.length === 1 ? "" : "s"}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {calls.length === 0 && <p className="text-sm text-stone-400">Every tool the assistant uses will appear here, live.</p>}
        {calls.map((c) => (
          <article key={c.id} className="slide-in rounded-lg border border-stone-800 bg-stone-950 p-3">
            <div className="flex items-center gap-2">
              <StatusDot status={c.status} />
              <code className="text-sm font-semibold text-amber-300">{c.name}</code>
              <span className="ml-auto text-xs text-stone-400">{c.status === "running" ? "running…" : `${c.durationMs} ms`}</span>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-wide text-stone-500">Input</p>
            <pre className="max-h-28 overflow-auto rounded bg-stone-900 p-2 text-xs text-stone-300">{json(c.input)}</pre>
            {c.status !== "running" && (
              <>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-stone-500">Output</p>
                <pre className="max-h-40 overflow-auto rounded bg-stone-900 p-2 text-xs text-stone-300">{json(c.output)}</pre>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}