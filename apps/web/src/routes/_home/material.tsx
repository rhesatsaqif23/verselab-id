// Material route: renders the materi page.
import { createFileRoute } from "@tanstack/react-router";
import { getAllUnits } from "#/libs/content-fns.ts";
import { AboutPage } from "../../features/about";

export const Route = createFileRoute("/_home/material")({
  loader: async () => {
    const units = await getAllUnits();
    return { units };
  },
  component: AboutPage,
});
