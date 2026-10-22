# Kitchen Copilot

A **simulated Alexa+ experience**: a voice-first cooking assistant that understands
natural language, picks the right tool, runs it, and answers. Every tool call is shown
live so you can see exactly how the assistant works.

Companion repo: [Kitchen MCP Server](https://github.com/whybhvi-stack/kitchen-mcp-server)

Built for the **Amazon Developer Hackathon, Alexa+ track** (simulated-experience path).

## What it does

Say or type things like:

- "What's expiring soon?"
- "I have 20 minutes. What can I cook, and add whatever I'm missing to my shopping list."
- "Walk me through the garlic tomato pasta."
- "Start a 10 minute timer for the pasta."

The assistant chains several tool calls for multi-step requests, offers proactive
suggestions for food that is about to expire, and replies in short spoken-style sentences.

## Architecture

```text
 Voice / text ──► Chat UI ─► Agent loop (Gemini function calling)
                                  │  tool call: name + JSON args
                                  ▼
                       Tool layer (MCP-style definitions)
                                  │  handler runs
                                  ▼
                 App state: pantry · shopping list · timers
                                  ▲
        Tool Calls panel (live log of every call, input, output, duration)
