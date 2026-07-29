import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

const config: Config = {
  title: "r8s — Kubernetes Infrastructure as TypeScript Components",
  description: "Build Kubernetes infrastructure with familiar TSX components. Composable, testable, and type-safe infrastructure as code.",
  extends: [vikeReact],
  // Docs content is fully generated at build time (scripts/generate-docs.ts)
  // — prerender every page to static HTML so the site can be served by
  // plain nginx without a Node SSR runtime.
  prerender: true,
};

export default config;
