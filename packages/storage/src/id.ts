import { nanoid } from "nanoid";

/**
 * Generate a unique ID using nanoid
 * Used for BetterAuth table IDs
 */
export function createId(): string {
  return nanoid();
}
