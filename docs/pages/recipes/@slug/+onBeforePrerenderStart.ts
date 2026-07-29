import { recipes } from "../../../data/recipes";

// Prerender every recipe page at build time — the data is generated
// by scripts/generate-docs.ts before `vike build` runs.
export function onBeforePrerenderStart() {
  return recipes.map((recipe) => `/recipes/${recipe.slug}`);
}
