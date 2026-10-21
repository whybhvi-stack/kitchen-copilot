import { runDemo, stopDemo } from "../demo";
import { useStore } from "../store";

export function DemoButton() {
  const running = useStore((s) => s.demoRunning);
  return (
    <button
      type="button"
      onClick={() => (running ? stopDemo() : void runDemo())}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-amber-400 ${
        running ? "bg-red-500 text-white hover:bg-red-400" : "bg-amber-500 text-stone-950 hover:bg-amber-400"
      }`}
    >
      {running ? "■ Stop demo" : "▶ Run demo"}
    </button>
  );
}

export function DemoCaption() {
  const caption = useStore((s) => s.demoCaption);
  if (!caption) return null;
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-10 flex justify-center px-4">
      <p className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-stone-950 shadow-lg">
        {caption}
      </p>
    </div>
  );
}