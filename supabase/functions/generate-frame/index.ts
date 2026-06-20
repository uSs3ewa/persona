import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckInDraft {
  sleep_hours: number;
  sleep_bedtime?: string;
  mood?: number;
  energy?: number;
  activity?: string;
  nutrition?: string;
  note?: string;
}

interface DailyEntry {
  entry_date: string;
  sleep_hours: number;
  mood: number;
  energy: number;
  activity: string;
  nutrition: string;
  note?: string;
  generated_frame?: string;
}

interface Insight {
  title: string;
  body: string;
  type: "recovery" | "focus" | "energy" | "nutrition" | "pattern";
}

interface AIResponse {
  frame_title: string;
  frame_sub: string;
  insights: Insight[];
}

function buildPrompt(draft: CheckInDraft, recentEntries: DailyEntry[]): string {
  const recentSummary = recentEntries.length > 0
    ? recentEntries
        .map(
          (e) =>
            `- ${e.entry_date}: sleep=${e.sleep_hours}h, mood=${e.mood}/5, energy=${e.energy}/10, activity=${e.activity}, nutrition=${e.nutrition}${e.note ? `, note="${e.note}"` : ""}`
        )
        .join("\n")
    : "(no recent entries)";

  return `You are a wellness coach for a daily state-awareness app called Persona.

Based on the user's check-in data, generate a personalized "Frame" — a short mental model for their day.

## Today's check-in
- Sleep: ${draft.sleep_hours}h${draft.sleep_bedtime ? ` (bedtime ${draft.sleep_bedtime})` : ""}
- Mood: ${draft.mood ?? "not reported"}/5
- Energy: ${draft.energy ?? "not reported"}/10
- Activity: ${draft.activity ?? "not reported"}
- Nutrition: ${draft.nutrition ?? "not reported"}
- Note: ${draft.note || "(none)"}

## Recent history (most recent first)
${recentSummary}

## Instructions
Generate a JSON response with exactly this structure:
{
  "frame_title": "A 2-4 word title that captures the day's mental model (e.g. 'Recovery Mode', 'Deep Work Window', 'Steady Momentum')",
  "frame_sub": "One sentence (under 120 chars) explaining the frame and what the user should focus on.",
  "insights": [
    {
      "title": "Short insight title (3-6 words)",
      "body": "One actionable sentence.",
      "type": "recovery" | "focus" | "energy" | "nutrition" | "pattern"
    }
  ]
}

## Rules
- frame_title must be specific to THIS user's data — never generic
- Generate exactly 1-3 insights, each actionable and specific to the data
- If the user provided a note, incorporate their intent or context
- Look for patterns across recent entries when available (e.g. "3rd day of low sleep")
- Use the "pattern" insight type when you notice a trend across recent entries
- Keep tone direct and grounded — no motivational fluff
- Return ONLY the JSON object, no markdown, no explanation`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!OPENAI_API_KEY) {
    console.error("[generate-frame] OPENAI_API_KEY is not set in Supabase secrets");
    return new Response(
      JSON.stringify({
        error: "AI service is not configured. Set OPENAI_API_KEY in Supabase secrets.",
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { draft, recentEntries } = await req.json();

    if (!draft || typeof draft.sleep_hours !== "number") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(draft, recentEntries || []);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[generate-frame] OpenAI API error ${response.status}:`, errorBody);
      return new Response(
        JSON.stringify({
          error: `LLM provider returned status ${response.status}`,
          detail: errorBody,
        }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[generate-frame] Empty response from OpenAI:", completion);
      return new Response(
        JSON.stringify({ error: "LLM returned an empty response" }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    let parsed: AIResponse;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[generate-frame] Failed to parse LLM output as JSON:", content);
      return new Response(
        JSON.stringify({ error: "LLM returned invalid JSON", raw: content }),
        {
          status: 502,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        }
      );
    }

    const result: AIResponse = {
      frame_title: typeof parsed.frame_title === "string" ? parsed.frame_title.trim() : "Your Frame",
      frame_sub: typeof parsed.frame_sub === "string" ? parsed.frame_sub.trim() : "",
      insights: Array.isArray(parsed.insights)
        ? parsed.insights
            .filter(
              (i: any) =>
                i &&
                typeof i.title === "string" &&
                typeof i.body === "string" &&
                ["recovery", "focus", "energy", "nutrition", "pattern"].includes(i.type)
            )
            .slice(0, 3)
        : [],
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-frame] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error in generate-frame",
        message: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  }
});
