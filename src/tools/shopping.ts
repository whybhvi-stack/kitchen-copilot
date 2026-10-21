import { getState, setState } from "../store";
import type { ToolDef } from "./types";

export const addToShoppingList: ToolDef = {
  name: "add_to_shopping_list",
  description: "Add one item to the shopping list. Call once per item.",
  inputSchema: {
    type: "object",
    properties: {
      item: { type: "string", description: "Item name, e.g. 'parmesan'" },
      quantity: { type: "string", description: "Optional quantity, only if the user stated one" },
    },
    required: ["item"],
  },
  handler: (a) => {
    const item = String(a.item ?? "").trim().toLowerCase();
    if (!item) throw new Error("item is required");
    const quantity = a.quantity ? String(a.quantity) : undefined;
    const exists = getState().shopping.some((i) => i.item === item);
    if (!exists) setState((s) => ({ shopping: [...s.shopping, { item, quantity }] }));
    return { item, quantity: quantity ?? null, already_on_list: exists };
  },
};

export const getShoppingList: ToolDef = {
  name: "get_shopping_list",
  description: "Return everything currently on the shopping list.",
  inputSchema: { type: "object", properties: {} },
  handler: () => ({ items: getState().shopping }),
};