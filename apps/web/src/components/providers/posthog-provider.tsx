"use client";

import { env } from "@projects/env";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

/**
 * PostHog Analytics Provider
 *
 * Initializes PostHog with privacy-conscious defaults:
 * - Local reverse proxy to bypass ad blockers
 * - Session replay with input masking
 * - Autocapture limited to actionable elements
 * - GDPR-friendly identified-only person profiles
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize PostHog (client-side only)
    if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
      posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest", // Use local reverse proxy to bypass ad blockers
        ui_host: env.VITE_PUBLIC_POSTHOG_HOST, // PostHog UI for session replay playback
        person_profiles: "identified_only", // GDPR-friendly: only track identified users

        // Session Replay with Privacy Controls
        session_recording: {
          maskAllInputs: true, // Mask all inputs by default
          maskInputOptions: {
            password: true, // ALWAYS mask passwords
          },
          maskTextSelector: ".sensitive, .ph-no-capture", // Custom masking
        },

        // Autocapture Configuration
        autocapture: {
          dom_event_allowlist: ["click", "change", "submit"], // Only track these events
          url_allowlist: ["/app/*", "/auth/*"], // Only track app + auth areas
          element_allowlist: ["button", "a", "input"], // Only track actionable elements
        },

        // Performance & Debugging
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.debug(); // Enable debug logs in dev
          }
        },
      });
    }
  }, []);

  // If no PostHog key, just render children without provider
  if (!env.VITE_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Identify a user in PostHog
 * Call this after authentication to track user-specific events
 */
export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

/**
 * Set organization group in PostHog
 * Call this when user switches organizations
 */
export function setOrganization(
  orgId: string,
  properties?: {
    name?: string;
    slug?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.group("organization", orgId, properties);
  }
}

/**
 * Reset user identity in PostHog
 * Call this on logout
 */
export function resetUser() {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.reset();
  }
}
