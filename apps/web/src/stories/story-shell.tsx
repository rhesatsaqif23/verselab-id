// StoryShell: router context + query client for layout stories.
// Layout chrome reads `useLocation()` and `resolveSession()`, so stories need
// both providers without pulling in the real route loaders.
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({});
const childRoutes = ["/", "/home", "/material", "/profile", "/admin"].map((path) =>
  createRoute({ getParentRoute: () => rootRoute, path }),
);

const router = createRouter({
  routeTree: rootRoute.addChildren(childRoutes),
  history: createMemoryHistory({ initialEntries: ["/home"] }),
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } },
});

export function StoryShell({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>{children}</RouterContextProvider>
    </QueryClientProvider>
  );
}
