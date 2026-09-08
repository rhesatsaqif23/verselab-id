// Home route: renders the home dashboard page.
import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../../features/home";

export const Route = createFileRoute("/_home/home")({ component: HomePage });
