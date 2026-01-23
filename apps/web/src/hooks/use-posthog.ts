import { usePostHog as usePostHogBase } from "posthog-js/react";

/**
 * Type-safe wrapper for PostHog hook
 * Provides convenience methods for tracking events
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const posthog = usePostHog();
 *
 *   const handleClick = () => {
 *     posthog.capture("feature_used", { featureName: "my-feature" });
 *   };
 *
 *   return <button onClick={handleClick}>Use Feature</button>;
 * }
 * ```
 */
export function usePostHog() {
  const posthog = usePostHogBase();

  return {
    /**
     * Capture an analytics event
     */
    capture: (event: string, properties?: Record<string, unknown>) => {
      posthog?.capture(event, properties);
    },

    /**
     * Identify a user (usually handled by PostHogProvider)
     */
    identify: (userId: string, properties?: Record<string, unknown>) => {
      posthog?.identify(userId, properties);
    },

    /**
     * Reset user identity (on logout)
     */
    reset: () => posthog?.reset(),

    /**
     * Set user properties without overwriting existing
     */
    setPersonProperties: (properties: Record<string, unknown>) => {
      posthog?.setPersonProperties(properties);
    },

    /**
     * Set organization group (for multi-tenant apps)
     */
    group: (type: string, key: string, properties?: Record<string, unknown>) => {
      posthog?.group(type, key, properties);
    },

    /**
     * Check if a feature flag is enabled
     */
    isFeatureEnabled: (flagKey: string) => {
      return posthog?.isFeatureEnabled(flagKey) ?? false;
    },

    /**
     * Get feature flag value (for multivariate flags)
     */
    getFeatureFlag: (flagKey: string) => {
      return posthog?.getFeatureFlag(flagKey);
    },
  };
}
