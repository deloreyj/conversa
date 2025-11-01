import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/db";
import { env } from 'cloudflare:workers';

export const createAuth = () =>
  betterAuth({
    baseUrl: env.BETTER_AUTH_URL,
    database: prismaAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: ["http://localhost:*", env.BETTER_AUTH_URL],
  });
