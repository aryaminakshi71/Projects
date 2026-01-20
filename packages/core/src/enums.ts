// Core enums - single source of truth for all system enums

// Organization roles
export const ORGANIZATION_ROLE_VALUES = ['owner', 'admin', 'member'] as const
export type OrganizationRole = (typeof ORGANIZATION_ROLE_VALUES)[number]

// Project status
export const PROJECT_STATUS_VALUES = [
  'draft',
  'active',
  'on_hold',
  'completed',
  'archived',
] as const
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number]

// Billing plans
export const BILLING_PLAN_VALUES = ['free', 'pro', 'enterprise'] as const
export type BillingPlan = (typeof BILLING_PLAN_VALUES)[number]

// Subscription status
export const SUBSCRIPTION_STATUS_VALUES = [
  'active',
  'canceled',
  'past_due',
  'trialing',
] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS_VALUES)[number]

// Billing interval
export const BILLING_INTERVAL_VALUES = ['month', 'year'] as const
export type BillingInterval = (typeof BILLING_INTERVAL_VALUES)[number]
