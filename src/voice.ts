// Browser voice helpers (Web Speech API). Works best in Chrome and Edge.
const RECOGNITION_LANG = "en-IN"; // change to "en-US" if recognition feels off

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

const w = window as unknown as {
  SpeechRecognition?: RecognitionCtor;
  webkitSpeechRecognition?: RecognitionCtor;
};
const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;

export const voiceSupported = Boolean(Ctor);

interface ListenHandlers {
  onText: (text: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

/** Listen for one spoken phrase. Returns a function that stops listening. */
export function listenOnce(h: ListenHandlers): () => void {
  if (!Ctor) {
    h.onError("Voice input isn't supported in this browser. Use Chrome or Edge, or type instead.");
    h.onEnd();
    return () => {};
  }
  const rec = new Ctor();
  rec.lang = RECOGNITION_LANG;
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript;
    if (text) h.onText(text);
  };
  rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      h.onError("Microphone access is blocked. Allow it in your browser's address bar, or type instead.");
    } else if (e.error === "no-speech") {
      h.onError("I didn't hear anything. Tap the mic and try again.");
    } else if (e.error !== "aborted") {
      h.onError("Voice input had a problem. You can type instead.");
    }
  };
  rec.onend = h.onEnd;
  try {
    rec.start();
  } catch {
    h.onError("Couldn't start the microphone. You can type instead.");
    h.onEnd();
  }
  return () => rec.stop();
}

/** Speak text aloud. Resolves when finished (or after a safety timeout). */
export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, Math.max(4000, text.length * 100));
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}