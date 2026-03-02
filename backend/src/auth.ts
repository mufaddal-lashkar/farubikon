import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { organization } from "better-auth/plugins";

import { users, session, account, verification, organization as organizationTable, member, invitation } from "./db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: users,
            session: session,
            account: account,
            verification: verification,
            organization: organizationTable,
            member: member,
            invitation: invitation
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    plugins: [organization()],
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
});

// The session type BetterAuth gives us after validation
export type Session = typeof auth.$Infer.Session;