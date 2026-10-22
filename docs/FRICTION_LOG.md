# Friction Log

## 1. Gemini API: invalid key on first run
- **Task attempted:** Call Gemini from the app for the first time.
- **Steps taken:** Created a key in AI Studio, put it in `.env`, ran the app.
- **Expected vs actual:** Expected a reply. Got HTTP 401 UNAUTHENTICATED ("API key not valid"). The same key tested in the browser against the models endpoint returned 400 INVALID_ARGUMENT, so the same problem shows up with two different status codes.
- **Severity:** medium
- **Workaround:** Created a new key and recreated `.env`.
- **Suggestion:** Say why a key is invalid (typo, deleted, restricted) and return the same status code for the same problem.

## 2. Gemini API: model name not found (404)
- **Task attempted:** Pick a model for function calling.
- **Steps taken:** Set a model name in `.env`.
- **Expected vs actual:** Expected it to work. Got a "model not found" error.
- **Severity:** medium
- **Workaround:** Listed valid models through the `/v1beta/models` endpoint and picked a current flash model.
- **Suggestion:** Make the error list valid model names, and document stable aliases.

## 3. Gemini API: 503 "high demand"
- **Task attempted:** Send a normal request.
- **Expected vs actual:** Expected a reply. Got 503 UNAVAILABLE saying the model was experiencing high demand.
- **Severity:** medium
- **Workaround:** Added retries with backoff and an optional fallback model.
- **Suggestion:** Include a retry-after hint in the response.

## 4. Gemini API: free-tier quota used up fast with tool calling
- **Task attempted:** Run a multi-step demo ("what can I cook, add what's missing to my list").
- **Expected vs actual:** One user message makes several API calls (one per tool round), plus retries. Hit the usage limit after a few conversations.
- **Severity:** high
- **Workaround:** Spaced out requests, switched models, recorded in short pieces.
- **Suggestion:** Show remaining quota and reset time in the error, and document how many calls one function-calling turn uses.

## 5. MCP TypeScript SDK: unclear which version to use
- **Task attempted:** Build a Streamable HTTP MCP server for spec 2025-11-25.
- **Expected vs actual:** The docs offer v1.x and a v2 beta, and it isn't obvious which one to use for the hackathon's spec requirement.
- **Severity:** low
- **Workaround:** Pinned `@modelcontextprotocol/sdk@1`.
- **Suggestion:** Add a table mapping SDK versions to supported spec versions.

## 6. Browser speech recognition support
- **Task attempted:** Voice input.
- **Expected vs actual:** The Web Speech API works in Chrome and Edge only, so the app needs a typed fallback.
- **Severity:** low
- **Workaround:** Text input and suggestion chips.
- **Suggestion:** Wider browser support.