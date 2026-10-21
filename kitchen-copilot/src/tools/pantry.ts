import { getState, setState } from "../store";
import { daysUntil } from "../lib/dates";
import type { PantryItem } from "../types";
import type { ToolDef } from "./types";

const withDays = (i: PantryItem) => ({
  ...i,
  expiresInDays: i.expiry ? daysUntil(i.expiry) : null,
});

export const getPantry: ToolDef = {
  name: "get_pantry",
  description: "List everything currently in the user's pantry with quantities and days until expiry.",
  inputSchema: { type: "object", properties: {} },
  handler: () => ({ items: getState().pantry.map(withDays) }),
};

export const addPantryItem: ToolDef = {
  name: "add_pantry_item",
  description: "Add an item to the pantry, or update its quantity if it already exists.",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Item name, e.g. 'eggs'" },
      quantity: { type: "string", description: "Quantity with unit, e.g. '12' or '1 kg'" },
      expiry: { type: "string", description: "Optional expiry date as YYYY-MM-DD" },
    },
    required: ["name", "quantity"],
  },
  handler: (a) => {
    const name = String(a.name ?? "").trim().toLowerCase();
    if (!name) throw new Error("name is required");
    const quantity = String(a.quantity ?? "1");
    const expiry = a.expiry ? String(a.expiry) : undefined;
    setState((s) => {
      const exists = s.pantry.some((p) => p.name === name);
      const pantry = exists
        ? s.pantry.map((p) => (p.name === name ? { ...p, quantity, expiry: expiry ?? p.expiry } : p))
        : [...s.pantry, { name, quantity, expiry }];
      return { pantry };
    });
    return { added: name, quantity, expiry: expiry ?? null };
  },
};

export const getExpiringItems: ToolDef = {
  name: "get_expiring_items",
  description: "List pantry items that expire within the given number of days, soonest first.",
  inputSchema: {
    type: "object",
    properties: { days: { type: "number", description: "Look-ahead window in days (default 3)" } },
  },
  handler: (a) => {
    const days = Number(a.days ?? 3);
    const items = getState()
      .pantry.filter((p) => p.expiry && daysUntil(p.expiry) <= days)
      .map(withDays)
      .sort((x, y) => (x.expiresInDays ?? 0) - (y.expiresInDays ?? 0));
    return { within_days: days, items };
  },
};