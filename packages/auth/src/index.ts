/**
 * Better Auth Server Configuration
 *
 * Full-featured authentication for Cloudflare Workers with:
 * - OAuth providers (Google, GitHub)
 * - Organization/team support
 * - Stripe billing (optional)
 * - API key authentication
 *
 * Pattern adapted from Fanbeam/Samva.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization, apiKey, openAPI } from "better-auth/plugins";
import type { Database } from "@projects/storage";
import { user, session, account, verification, organization as orgTable, member, invitation } from "@projects/storage/schema";
import { createKVStorage } from "./kv-storage";
import { createStripePlugin, createStripeClient } from "./config/stripe";

export interface AuthConfig {
  /** Database instance from @projects/storage */
  db: Database;
  /** Cloudflare KV namespace for session storage (optional, only for production) */
  kv?: KVNamespace;
  /** Better Auth secret (32+ characters) */
  secret: string;
  /** Base URL for the app (e.g., https://example.com) */
  baseURL: string;
  /** OAuth provider credentials */
  oauth?: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    github?: {
      clientId: string;
      clientSecret: string;
    };
  };
  /** Stripe billing configuration (optional) */
  stripe?: {
    secretKey: string;
    webhookSecret: string;
  };
  /** Trusted origins for CORS */
  trustedOrigins?: string[];
}

/**
 * Create a Better Auth instance configured for Cloudflare Workers
 */
export function createAuth(config: AuthConfig) {
  const { db, kv, secret, baseURL, oauth, stripe, trustedOrigins = [] } = config;

  // Build plugins array
  const plugins: any[] = [
    // Organization/team support
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 3, // Free tier limit
      sendInvitationEmail: async ({ email, organization, inviter }: { email: string; organization: any; inviter: any }) => {
        // TODO: Implement email sending
        console.log(`Invitation to ${email} for org ${organization.name} from ${inviter.user.name}`);
      },
    }),

    // API key authentication
    apiKey({
      enableMetadata: true,
      apiKeyHeaders: "x-api-key",
    }),

    // OpenAPI documentation
    openAPI(),
  ];

  // Add Stripe plugin if configured
  if (stripe?.secretKey && stripe?.webhookSecret) {
    const stripeClient = createStripeClient(stripe.secretKey);
    plugins.push(
      createStripePlugin({
        stripeClient,
        webhookSecret: stripe.webhookSecret,
        db,
      })
    );
  }

  // Build auth configuration
  const authConfig: any = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    secret,
    baseURL,
    basePath: "/api/auth",

    // Session configuration
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24 * 7, // 7 days
      cookieCache: { enabled: true, maxAge: 300 }, // 5 min edge cache
    },

    // Email/password enabled
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Can be enabled in production
    },

    // OAuth providers
    socialProviders: {
      ...(oauth?.google && {
        google: {
          clientId: oauth.google.clientId,
          clientSecret: oauth.google.clientSecret,
        },
      }),
      ...(oauth?.github && {
        github: {
          clientId: oauth.github.clientId,
          clientSecret: oauth.github.clientSecret,
        },
      }),
    },

    // Account linking for OAuth
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
        allowDifferentEmails: false,
        allowUnlinkingAll: false,
      },
    },

    // Plugins
    plugins,

    // Advanced settings
    advanced: {
      useSecureCookies: true,
      cookiePrefix: "projects",
      database: {
        generateId: () => crypto.randomUUID(),
      },
    },

    // Trusted origins
    trustedOrigins: [baseURL, ...trustedOrigins],
  };

  // Only use secondary storage if KV is properly configured (production/Cloudflare only)
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
    authConfig.secondaryStorage = createKVStorage(kv);
  }

  return betterAuth(authConfig);
}

export type Auth = ReturnType<typeof createAuth>;

// Re-export client utilities
export { authClient, useSession, signIn, signUp, signOut } from "./client";
export type { Session, User } from "./client";
