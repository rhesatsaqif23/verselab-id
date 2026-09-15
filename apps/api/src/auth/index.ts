import { betterAuth } from "better-auth";
import { env } from "../config/env.ts";
import { buildAuthOptions } from "./config.ts";

export const auth = betterAuth(buildAuthOptions(env));

export type Session = typeof auth.$Infer.Session;
