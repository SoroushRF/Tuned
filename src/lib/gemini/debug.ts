export function isGeminiDebugEnabled() {
  const flag = (process.env.GEMINI_DEBUG || process.env.NEXT_PUBLIC_GEMINI_DEBUG || "").toLowerCase();
  // Only treat explicit "true" (or "1") as enabled to avoid accidental verbose logs.
  return flag === "true" || flag === "1";
}

export function createGeminiDebugId(routeName: string) {
  const uuid = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 10);
  return `${routeName}-${uuid.slice(0, 8)}`;
}

export function summarizeText(value: string, maxLength = 800) {
  if (!value) return "";
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}...` : compact;
}

export function logGeminiRequest(routeName: string, requestId: string, details: Record<string, unknown>) {
  if (!isGeminiDebugEnabled()) return;
  console.log(`[gemini:${routeName}] ${requestId} request`, details);
}

export function logGeminiResponse(routeName: string, requestId: string, ms: number, details: Record<string, unknown>) {
  if (!isGeminiDebugEnabled()) return;
  console.log(`[gemini:${routeName}] ${requestId} response in ${ms}ms`, details);
}

export function logGeminiError(routeName: string, requestId: string, error: unknown) {
  if (!isGeminiDebugEnabled()) return;
  console.error(`[gemini:${routeName}] ${requestId} error`, error);
}
