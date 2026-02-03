/**
 * Projects AI Features
 *
 * AI-powered features for Projects:
 * - Task prioritization
 * - Time estimation
 * - Risk prediction
 * - Resource optimization
 */

import { createAIClient, predictScore, generateSuggestions } from "./ai";

const ai = createAIClient({ provider: "openai" });

/**
 * Prioritize tasks
 */
export async function prioritizeTask(
  taskData: {
    title: string;
    description?: string;
    deadline?: string;
    dependencies?: string[];
  }
): Promise<{ priority: number; reasoning: string }> {
  if (!ai) {
    return { priority: 50, reasoning: "AI not configured" };
  }

  const context = `Task: ${taskData.title}, Description: ${taskData.description || "N/A"}, Deadline: ${taskData.deadline || "N/A"}`;
  const prediction = await predictScore(ai, context, "priority");
  return {
    priority: prediction.score,
    reasoning: prediction.reasoning,
  };
}

/**
 * Estimate task time
 */
export async function estimateTaskTime(
  taskDescription: string,
  complexity: "low" | "medium" | "high"
): Promise<{ hours: number; reasoning: string }> {
  if (!ai) {
    return { hours: 8, reasoning: "AI not configured" };
  }

  const context = `Task: ${taskDescription}, Complexity: ${complexity}`;
  const suggestions = await generateSuggestions(ai, "Projects", context, "insights");
  // Estimate based on complexity and suggestions
  const baseHours = complexity === "low" ? 2 : complexity === "medium" ? 8 : 16;
  return {
    hours: baseHours,
    reasoning: suggestions.join("; "),
  };
}

/**
 * Predict project risk
 */
export async function predictProjectRisk(
  projectData: {
    name: string;
    deadline?: string;
    teamSize?: number;
    budget?: number;
  }
): Promise<{ score: number; reasoning: string }> {
  if (!ai) {
    return { score: 50, reasoning: "AI not configured" };
  }

  const context = `Project: ${projectData.name}, Deadline: ${projectData.deadline || "N/A"}, Team: ${projectData.teamSize || "N/A"}, Budget: ${projectData.budget || "N/A"}`;
  return await predictScore(ai, context, "risk");
}
