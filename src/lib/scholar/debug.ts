const flag = (process.env.SCHOLAR_DEBUG || process.env.NEXT_PUBLIC_SCHOLAR_DEBUG || '').toLowerCase();

export const isScholarDebugEnabled = flag === '1' || flag === 'true' || flag === 'yes';

export function logScholarDebug(message: string, details?: Record<string, unknown>) {
  if (!isScholarDebugEnabled) return;

  if (details && Object.keys(details).length > 0) {
    console.log(`[scholar] ${message}`, details);
    return;
  }

  console.log(`[scholar] ${message}`);
}
