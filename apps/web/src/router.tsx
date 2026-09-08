// Router factory: creates the app router from the generated route tree.
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import type { resolveSession } from "#/libs/session.ts";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface RouterContext {
    session?: Awaited<ReturnType<typeof resolveSession>>;
  }
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
