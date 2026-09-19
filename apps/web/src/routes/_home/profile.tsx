// Profile route: renders the profile page.
import { createFileRoute } from "@tanstack/react-router";
import { getAllUnits } from "#/libs/content-fns.ts";
import { ProfilePage } from "../../features/profile";

export const Route = createFileRoute("/_home/profile")({
  loader: async () => {
    const units = await getAllUnits();
    return { units };
  },
  component: ProfilePage,
});
