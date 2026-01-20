/**
 * Centralized application configuration constants
 *
 * Non-sensitive configuration that doesn't need to be in environment variables.
 */

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Currency settings
  currency: "usd",

  // Statement Descriptor
  statementDescriptor: "Projects",

  // Billing settings
  billing: {
    // Allow promo codes in checkout
    allowPromoCodes: true,
    // Trial period for new users (in days)
    trialDays: 14,
  },

  // Webhook events we handle
  webhookEvents: [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "charge.refunded",
  ],
} as const;

// Application Configuration
export const APP_CONFIG = {
  // Projects limits
  limits: {
    // Maximum projects per organization
    maxProjects: 10000,
    // Maximum tasks per project
    maxTasksPerProject: 10000,
    // Maximum team members per project
    maxTeamMembers: 100,
  },

  // Rate limiting
  rateLimit: {
    // Max API calls per minute per user
    apiCallsPerMinute: 60,
    // Max project updates per hour per user
    projectUpdatesPerHour: 200,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 50,
    maxLimit: 200,
  },
} as const;

// Billing UI URLs
export const BILLING_URLS = {
  defaultSuccess: "/app/settings/billing?success=true",
  defaultCancel: "/app/settings/billing",
} as const;

// Authentication / Access Control
export const AUTH_POLICY = {
  staging: {
    // Exact email allowlist for staging (lowercase)
    allowedEmails: [] as string[],
    // Allowed email domains for staging (lowercase, without leading @)
    allowedDomains: [] as string[],
  },
} as const;

// Database Configuration
export const DB_CONFIG = {
  // Transaction history
  transactions: {
    // Default number of transactions to return
    defaultLimit: 50,
    // Maximum transactions that can be fetched
    maxLimit: 200,
  },

  // Cleanup settings
  cleanup: {
    // Delete old activity records after (days)
    activityRetentionDays: 90,
    // Delete old audit logs after (days)
    auditLogRetentionDays: 365,
  },
} as const;

// Export type helpers
export type StripeConfig = typeof STRIPE_CONFIG;
export type AppConfig = typeof APP_CONFIG;
export type DbConfig = typeof DB_CONFIG;
export type AuthPolicy = typeof AUTH_POLICY;
export type BillingUrls = typeof BILLING_URLS;
