import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const html = await response.text();

    // Very basic HTML stripping - in production you'd use a more robust parser
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 15000); // Token limit from PRD

    return NextResponse.json({ text: cleanText });
  } catch (error) {
    console.error("Fetch URL failing:", error);
    return NextResponse.json({ error: "Failed to fetch link or timed out." }, { status: 504 });
  }
}
