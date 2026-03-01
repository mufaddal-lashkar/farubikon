import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    plugins: [organization()],
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: ["http://localhost:3001"],
});

// The session type BetterAuth gives us after validation
export type Session = typeof auth.$Infer.Session;