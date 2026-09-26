import { createApp, type App } from "./app.ts";
import { env } from "./config/env.ts";

export const app = createApp().listen(env.PORT);
export type { App };
