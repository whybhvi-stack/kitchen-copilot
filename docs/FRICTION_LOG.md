# Friction Log

## Entry 1
- **Task attempted:** Initial project scaffolding with Vite, React, TS, and Tailwind.
- **Steps taken:** Ran `npm create vite`, installed Tailwind and Gemini dependencies, configured `vite.config.ts` and `index.css`.
- **Expected vs actual:** Expected a smooth setup. Actual: GitHub secret scanning flagged the `.env.example` placeholder as a potential secret, requiring a manual "false positive" unblock.
- **Severity:** low
- **Workaround:** Navigated to the GitHub security URL provided in the terminal and marked the detection as a false positive.
- **Suggestion:** Hackathon guides could explicitly mention using dummy text like "your_key_here" instead of realistic-looking strings to avoid triggering GitHub's secret scanner.