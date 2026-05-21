import { NextResponse } from "next/server";

type SocialCaptionInput = {
  nameEn: string;
  description: string;
  categoryName?: string;
  activities?: string;
  location?: string;
  province?: string;
  bestTimeVisit?: string;
  entryFee?: string;
  // ✅ Add these new fields
  hasParking?: boolean;
  isFreeParking?: boolean;
  hasRestaurant?: boolean;
  hasAccommodation?: boolean;
  hasInternet?: boolean;
  isFreeWifi?: boolean;
  openTime?: string;
  closeTime?: string;
  nameLa?: string;
};
function buildPrompt(input: SocialCaptionInput) {
  const clean = (s?: string) => (s || "").trim().replace(/\s+/g, " ");
  const desc = clean(input.description);
  const shortDesc = desc.length > 150 ? `${desc.slice(0, 150).trim()}...` : desc;
  const locationShort = clean(input.location).split(",").slice(0, 2).join(",").trim();

  // Only include truthy facilities
  const facts: string[] = [
    input.entryFee ? (input.entryFee === "Free" ? "free entry" : `entry ${input.entryFee}`) : "",
    input.isFreeParking    ? "free parking"   : input.hasParking    ? "parking"   : "",
    input.isFreeWifi       ? "free WiFi"      : input.hasInternet   ? "WiFi"      : "",
    input.hasRestaurant    ? "restaurant"     : "",
    input.hasAccommodation ? "accommodation"  : "",
    (input.openTime && input.closeTime) ? `open ${input.openTime}–${input.closeTime}` : "",
  ].filter(Boolean);

  return [
    "Laos travel copywriter. Write 1 Instagram caption (60-80 words + 4-5 hashtags).",
    "Rules: hook opening, conversational tone, NO 'Discover/Explore/Nestled', weave in facts naturally, no lists.",
    `Must mention: name "${clean(input.nameEn)}"${locationShort ? `, location "${locationShort}"` : ""}${facts.length ? `, facts: ${facts.join(", ")}` : ""}.`,
    `Attraction: ${clean(input.nameEn)}. ${shortDesc}`,
    input.categoryName ? `Type: ${input.categoryName}.` : "",
    input.activities   ? `Activities: ${clean(input.activities)}.` : "",
    input.bestTimeVisit? `Best time: ${input.bestTimeVisit}.` : "",
    "Output caption only.",
  ].filter(Boolean).join(" ");
}
function extractText(result: any): string | null {
  const parts = result?.candidates?.[0]?.content?.parts;
  const text = parts?.map((p: any) => p?.text).filter(Boolean).join("").trim();
  return text || null;
}

export async function POST(req: Request) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  let body: SocialCaptionInput;
  try {
    body = (await req.json()) as SocialCaptionInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.nameEn || !body?.description) {
    return NextResponse.json({ error: "nameEn and description are required" }, { status: 400 });
  }

  const model = "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const prompt = buildPrompt(body);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,  // slightly higher = more creative
        topP: 0.95,
        maxOutputTokens: 800,
      },
    }),
  });

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const msg = data?.error?.message || `Gemini request failed (${resp.status})`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  let caption = extractText(data);
  if (!caption) {
    return NextResponse.json({ error: "Gemini returned empty caption" }, { status: 502 });
  }

  // Clean up any accidental wrapping quotes
  caption = caption.replace(/^["']|["']$/g, "").trim();

  return NextResponse.json({ caption });
}