import { resetSession, sendMessage } from "./assistant";
import { getState, setState } from "./store";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STEPS = [
  { caption: "Proactive help with expiring food", prompt: "What's expiring soon?" },
  {
    caption: "One request, several tool calls",
    prompt: "I have 20 minutes. What can I cook, and add whatever I'm missing to my shopping list.",
  },
  { caption: "Step-by-step guidance", prompt: "Great, walk me through the garlic tomato pasta." },
  { caption: "Hands-free timer", prompt: "Start a 10 minute timer for the pasta." },
  { caption: "Checking the list", prompt: "What's on my shopping list now?" },
];

let cancelled = false;

export const stopDemo = () => {
  cancelled = true;
};

async function typeInto(text: string) {
  for (let i = 1; i <= text.length; i++) {
    if (cancelled) return;
    setState(() => ({ draft: text.slice(0, i) }));
    await sleep(28);
  }
}

export async function runDemo() {
  if (getState().demoRunning) return;
  cancelled = false;
  resetSession();
  setState(() => ({ demoRunning: true }));
  try {
    await sleep(1200);
    for (const [i, step] of STEPS.entries()) {
      if (cancelled) break;
      setState(() => ({ demoCaption: `Step ${i + 1}/${STEPS.length}: ${step.caption}` }));
      await typeInto(step.prompt);
      if (cancelled) break;
      await sleep(400);
      const reply = await sendMessage(step.prompt);
      if (reply === null) break; // an error is already shown in chat
      await sleep(1200);
    }
  } finally {
    setState(() => ({ demoRunning: false, demoCaption: "", draft: "" }));
  }
}