// Seed admin user: upserts adminverse@gmail.com with role "admin".
import { eq } from "drizzle-orm";
import { getDb } from "../database/index.ts";
import { user } from "../database/auth-schema.ts";

const ADMIN_EMAIL = "adminverse@gmail.com";

async function seedAdmin() {
  const db = getDb();

  const [existing] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    if (existing.role === "admin") {
      console.log(`[seed] ${ADMIN_EMAIL} is already admin`);
      return;
    }
    await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
    console.log(`[seed] ${ADMIN_EMAIL} promoted to admin`);
    return;
  }

  console.log(`[seed] ${ADMIN_EMAIL} not found. Admin must register first, then re-run this script.`);
  console.log(`[seed] Alternatively, create the user via the app and run again.`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  });
