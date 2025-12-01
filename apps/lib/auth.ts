import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { createWallet } from "./actions/driver";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mongodb",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        nextCookies(),
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
    advanced: {
        database: {
            generateId: false, // Let MongoDB generate the IDs
        },

        cookiePrefix: "pataupesi",
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!, "http://localhost:3000"],
    user: {
        additionalFields: {
            phone: {
                type: "string",
                required: true,
            },
        },

    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await createWallet(user.id);
                },
            },

        },
    },
});