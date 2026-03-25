import { NeuroPrintVector, ProcessedOutput } from "@/types";

/**
 * Parsa - Core Transformation Engine
 * Uses the user's NeuroPrint vector to weight the output generation.
 */
/**
 * Unified Transformation Engine
 * Calls the secure backend API with the NeuroPrint context.
 */
export async function transformContent(text: string, vector: NeuroPrintVector): Promise<ProcessedOutput> {
  try {
    const res = await fetch('/api/gemini/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, vector })
    });

    if (!res.ok) throw new Error("Failed to process content via backend.");

    const data = await res.json();
    
    return {
      ...data,
      sessionId: Math.random().toString(36).substring(7),
      neuroPrint: vector
    };
  } catch (error) {
    console.error("Nuro Translation Error:", error);
    throw new Error("Neural synthesis failed. Possible network or processing timeout.");
  }
}
