import { getState } from "../store";
import { recipes } from "../data/recipes";
import type { ToolDef } from "./types";

export const suggestRecipes: ToolDef = {
  name: "suggest_recipes",
  description: "Suggest recipes ranked by how many ingredients the user already has. Each result lists missing ingredients.",
  inputSchema: {
    type: "object",
    properties: {
      max_time_minutes: { type: "number", description: "Maximum total cooking time in minutes" },
      diet: { type: "string", enum: ["any", "vegetarian", "vegan"], description: "Dietary filter" },
    },
  },
  handler: (a) => {
    const maxTime = a.max_time_minutes ? Number(a.max_time_minutes) : Infinity;
    const diet = String(a.diet ?? "any");
    const have = new Set(getState().pantry.map((p) => p.name));
    const results = recipes
      .filter((r) => r.timeMinutes <= maxTime)
      .filter((r) => diet === "any" || (diet === "vegan" ? r.diet === "vegan" : r.diet !== "any"))
      .map((r) => ({
        id: r.id,
        title: r.title,
        time_minutes: r.timeMinutes,
        diet: r.diet,
        missing: r.ingredients.filter((i) => !have.has(i)),
      }))
      .sort((x, y) => x.missing.length - y.missing.length)
      .slice(0, 5);
    return { recipes: results };
  },
};

export const getRecipeSteps: ToolDef = {
  name: "get_recipe_steps",
  description: "Get the ingredients and step-by-step instructions for a recipe, by id or title.",
  inputSchema: {
    type: "object",
    properties: { recipe_id: { type: "string", description: "Recipe id or title" } },
    required: ["recipe_id"],
  },
  handler: (a) => {
    const key = String(a.recipe_id ?? "").toLowerCase();
    const r = recipes.find((x) => x.id === key || x.title.toLowerCase() === key);
    if (!r) throw new Error(`No recipe found for "${key}"`);
    return { title: r.title, time_minutes: r.timeMinutes, ingredients: r.ingredients, steps: r.steps };
  },
};