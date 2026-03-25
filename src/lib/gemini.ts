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
  return transformContentWithPdf(text, vector, []);
}

export async function transformContentWithPdf(
  text: string,
  vector: NeuroPrintVector,
  pdfFiles: File[] = []
): Promise<ProcessedOutput> {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('vector', JSON.stringify(vector));
    pdfFiles.forEach((file) => formData.append('pdfs', file, file.name));

    const res = await fetch('/api/gemini/process', {
      method: 'POST',
      body: formData
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
