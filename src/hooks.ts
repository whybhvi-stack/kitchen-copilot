   import { useEffect, useState } from "react";
   import { addMessage, getState } from "./store";
   import { speak } from "./voice";

   export function useNow(intervalMs = 1000) {
     const [now, setNow] = useState(() => Date.now());
     useEffect(() => {
       const id = setInterval(() => setNow(Date.now()), intervalMs);
       return () => clearInterval(id);
     }, [intervalMs]);
     return now;
   }

   export function useTimerAnnouncements() {
     useEffect(() => {
       const announced = new Set<string>();
       const id = setInterval(() => {
         for (const t of getState().timers) {
           if (t.endsAt <= Date.now() && !announced.has(t.id)) {
             announced.add(t.id);
             const msg = `Your ${t.label} timer is done.`;
             addMessage("assistant", msg);
             if (!getState().muted) void speak(msg);
           }
         }
       }, 1000);
       return () => clearInterval(id);
     }, []);
   }