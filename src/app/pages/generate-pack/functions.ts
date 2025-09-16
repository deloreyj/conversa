"use server";

import { z } from "zod";
import { env } from "cloudflare:workers";

// Helper function to serialize workflow status safely
function serializeWorkflowStatus(status: any) {
  return {
    status: status.status,
    error: status.error,
    output: status.output,
    // Add any other safe properties you need
  };
}

// Request schema for pack generation
const GeneratePackRequestSchema = z.object({
  userPrompt: z.string().min(1).max(1000),
  userId: z.string().optional(),
});

export async function generateFlashcardPack(formData: FormData) {
  const rawData = {
    userPrompt: formData.get('userPrompt') as string,
    userId: formData.get('userId') as string || undefined,
  };

  // Validate the request
  const validationResult = GeneratePackRequestSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Invalid request data",
      details: validationResult.error.issues.map((issue: any) => issue.message).join(", "),
    };
  }

  const { userPrompt, userId } = validationResult.data;

  try {
    // Create a workflow instance
    const workflowInstance = await (env as any).FLASHCARD_PACK_GENERATOR.create({
      id: crypto.randomUUID(),
      params: {
        userPrompt,
        userId: userId || "all",
      },
    });

    const status = await workflowInstance.status();
    
    return {
      success: true,
      workflowId: workflowInstance.id,
      status: serializeWorkflowStatus(status),
      message: "Flashcard pack generation started! This may take a few minutes.",
    };
  } catch (error) {
    console.error("Failed to start workflow:", error);
    return {
      success: false,
      error: "Failed to start flashcard pack generation",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getWorkflowStatus(workflowId: string) {
  try {
    const instance = await (env as any).FLASHCARD_PACK_GENERATOR.get(workflowId);
    const status = await instance.status();
    
    return {
      success: true,
      status: serializeWorkflowStatus(status),
    };
  } catch (error) {
    console.error("Failed to get workflow status:", error);
    return {
      success: false,
      error: "Failed to get workflow status",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}