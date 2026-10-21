import { useEffect, useState } from "react";
import { useNow } from "../hooks";
import { daysUntil } from "../lib/dates";
import { useStore } from "../store";

type Tab = "pantry" | "shopping" | "timers";

function ExpiryBadge({ expiry }: { expiry?: string }) {
  if (!expiry) return null;
  const d = daysUntil(expiry);
  const label = d <= 0 ? "Expires today" : d === 1 ? "Tomorrow" : `${d} days`;
  const cls = d <= 1 ? "bg-red-500/15 text-red-300" : d <= 3 ? "bg-amber-500/15 text-amber-300" : "bg-stone-800 text-stone-400";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

function TimersTab() {
  const timers = useStore((s) => s.timers);
  const now = useNow();
  if (timers.length === 0) return <p className="text-sm text-stone-400">No timers running.</p>;
  return (
    <ul className="space-y-2">
      {timers.map((t) => {
        const left = Math.max(0, Math.round((t.endsAt - now) / 1000));
        const mm = String(Math.floor(left / 60)).padStart(2, "0");
        const ss = String(left % 60).padStart(2, "0");
        return (
          <li key={t.id} className="slide-in flex items-center justify-between rounded-lg bg-stone-950 px-3 py-2">
            <span className="text-sm">{t.label}</span>
            <span className={`font-mono text-lg ${left === 0 ? "text-emerald-400" : "text-amber-300"}`}>
              {left === 0 ? "Done ✓" : `${mm}:${ss}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function SidePanel() {
  const [tab, setTab] = useState<Tab>("pantry");
  const pantry = useStore((s) => s.pantry);
  const shopping = useStore((s) => s.shopping);
  const timers = useStore((s) => s.timers);

  useEffect(() => { if (shopping.length > 0) setTab("shopping"); }, [shopping.length]);
  useEffect(() => { if (timers.length > 0) setTab("timers"); }, [timers.length]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "pantry", label: "Pantry", count: pantry.length },
    { id: "shopping", label: "Shopping", count: shopping.length },
    { id: "timers", label: "Timers", count: timers.length },
  ];
  const sortedPantry = [...pantry].sort((a, b) => (a.expiry ?? "9999").localeCompare(b.expiry ?? "9999"));

  return (
    <section aria-label="Kitchen" className="flex h-[75vh] min-h-0 flex-col rounded-xl border border-stone-800 bg-stone-900 lg:h-auto">
      <div role="tablist" className="flex border-b border-stone-800">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-3 text-sm font-medium ${tab === t.id ? "border-b-2 border-amber-500 text-amber-300" : "text-stone-400 hover:text-stone-200"}`}>
            {t.label} <span className="text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "pantry" && (
          <ul className="space-y-2">
            {sortedPantry.map((p) => (
              <li key={p.name} className="flex items-center justify-between rounded-lg bg-stone-950 px-3 py-2">
                <div>
                  <p className="text-sm capitalize">{p.name}</p>
                  <p className="text-xs text-stone-500">{p.quantity}</p>
                </div>
                <ExpiryBadge expiry={p.expiry} />
              </li>
            ))}
          </ul>
        )}
        {tab === "shopping" && (shopping.length === 0 ? (
          <p className="text-sm text-stone-400">Your shopping list is empty.</p>
        ) : (
          <ul className="space-y-2">
            {shopping.map((i) => (
              <li key={i.item} className="slide-in flex items-center justify-between rounded-lg bg-stone-950 px-3 py-2">
                <span className="text-sm capitalize">{i.item}</span>
                {i.quantity && <span className="text-xs text-stone-500">{i.quantity}</span>}
              </li>
            ))}
          </ul>
        ))}
        {tab === "timers" && <TimersTab />}
      </div>
    </section>
  );
}