import Chat from "./components/Chat";
import Header from "./components/Header";
import SidePanel from "./components/SidePanel";
import ToolCallsPanel from "./components/ToolcallsPanel";
import { useTimerAnnouncements } from "./hooks";

export default function App() {
  useTimerAnnouncements();
  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100 lg:h-screen">
      <Header />
      <main className="grid flex-1 grid-cols-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-3">
        <Chat />
        <ToolCallsPanel />
        <SidePanel />
      </main>
    </div>
  );
}