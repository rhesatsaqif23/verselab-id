import { z } from "zod";

const envSchema = z
  .object({
    // Secrets are optional so unit tests can import modules without a database
    // or an auth stack; getDb() stays lazy and only connects when a service
    // actually queries.
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.string().url().optional(),
    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().url().optional(),
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    EMAIL_TRANSPORT: z.enum(["console"]).optional(),
    STORAGE_DRIVER: z.enum(["s3", "local"]).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_BASE_URL: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "test") return;
    for (const key of ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "DATABASE_URL"] as const) {
      if (!data[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `Required when NODE_ENV is not "test"`,
        });
      }
    }
    if (data.STORAGE_DRIVER === "s3") {
      for (const key of ["S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const) {
        if (!data[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `Required when STORAGE_DRIVER is "s3"`,
          });
        }
      }
    }
  });

type ParsedEnv = z.infer<typeof envSchema>;
export type AppEnv = ParsedEnv & {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL: string;
};

// superRefine guarantees these are present outside test mode; app code can rely
// on the narrowed type.
export const env: AppEnv = envSchema.parse(process.env) as AppEnv;

if (env.NODE_ENV === "development") {
  console.log(`[env] ${JSON.stringify({ ...env, BETTER_AUTH_SECRET: "***" })}`);
}
