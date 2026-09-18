// Home route: renders the home dashboard page.
import { createFileRoute } from "@tanstack/react-router";
import { getAllUnits } from "#/libs/content-fns.ts";
import { HomePage } from "../../features/home";

export const Route = createFileRoute("/_home/home")({
  loader: async () => {
    const units = await getAllUnits();
    return { units };
  },
  component: HomePage,
});
