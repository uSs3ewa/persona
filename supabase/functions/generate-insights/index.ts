import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DailyEntry {
  entry_date: string;
  sleep_hours: number;
  sleep_bedtime?: string;
  mood: number;
  energy: number;
  activity: string;
  nutrition: string;
  note?: string;
  generated_frame?: string;
  generated_frame_sub?: string;
  state_score?: number;
}

interface Insight {
  title: string;
  body: string;
  type: "recovery" | "focus" | "energy" | "nutrition" | "pattern";
  priority: "high" | "medium" | "low";
  confidence: number;
}

function computeAverages(entries: DailyEntry[]) {
  if (entries.length === 0) return null;
  const sum = entries.reduce(
    (acc, e) => ({
      sleep: acc.sleep + e.sleep_hours,
      mood: acc.mood + e.mood,
      energy: acc.energy + e.energy,
      score: acc.score + (e.state_score ?? 5),
    }),
    { sleep: 0, mood: 0, energy: 0, score: 0 }
  );
  const n = entries.length;
  return {
    avg_sleep: Math.round((sum.sleep / n) * 10) / 10,
    avg_mood: Math.round((sum.mood / n) * 10) / 10,
    avg_energy: Math.round((sum.energy / n) * 10) / 10,
    avg_score: Math.round((sum.score / n) * 10) / 10,
    count: n,
  };
}

function findTrends(entries: DailyEntry[]): string[] {
  if (entries.length < 3) return [];
  const trends: string[] = [];
  const recent3 = entries.slice(0, 3);
  const prev3 = entries.slice(3, 6);

  if (prev3.length >= 3) {
    const recentAvg = recent3.reduce((s, e) => s + e.energy, 0) / 3;
    const prevAvg = prev3.reduce((s, e) => s + e.energy, 0) / 3;
    if (recentAvg - prevAvg > 1.5) trends.push("energy_rising");
    if (prevAvg - recentAvg > 1.5) trends.push("energy_declining");
  }

  const sleepBelow6 = recent3.filter((e) => e.sleep_hours < 6).length;
  if (sleepBelow6 >= 2) trends.push("sleep_debt");

  const hardAfterPoorSleep = recent3.filter(
    (e) => e.activity === "hard" && e.sleep_hours < 6.5
  ).length;
  if (hardAfterPoorSleep >= 2) trends.push("overtraining");

  const lowMood = recent3.filter((e) => e.mood <= 2).length;
  if (lowMood >= 2) trends.push("mood_struggle");

  const goodNutrition = recent3.filter((e) => e.nutrition === "good").length;
  if (goodNutrition >= 3) trends.push("nutrition_streak");

  return trends;
}

function buildInsightPrompt(
  today: DailyEntry,
  recent7: DailyEntry[],
  recent30: DailyEntry[],
  averages: ReturnType<typeof computeAverages>,
  trends: string[]
): string {
  const last7 = recent7
    .map(
      (e) =>
        `${e.entry_date}: sleep=${e.sleep_hours}h, mood=${e.mood}/5, energy=${e.energy}/10, act=${e.activity}, nut=${e.nutrition}, score=${e.state_score ?? "?"}${e.note ? `, note="${e.note}"` : ""}${e.generated_frame ? `, frame="${e.generated_frame}"` : ""}`
    )
    .join("\n");

  const last30 = recent30
    .map((e) => `${e.entry_date}: sleep=${e.sleep_hours}h, energy=${e.energy}/10, mood=${e.mood}/5`)
    .join("\n");

  const avgText = averages
    ? `Averages over ${averages.count} entries: sleep=${averages.avg_sleep}h, mood=${averages.avg_mood}/5, energy=${averages.avg_energy}/10, score=${averages.avg_score}/10`
    : "Not enough history for averages.";

  const trendText =
    trends.length > 0
      ? `Detected trends: ${trends.join(", ")}`
      : "No strong trends detected.";

  return `You are an intelligent wellness coach for a daily state-awareness app called Persona.

Your job is to generate deeply personalized insights based on the user's FULL history, not just today. You are a coach who knows this user over time.

## Today's entry
- Date: ${today.entry_date}
- Sleep: ${today.sleep_hours}h${today.sleep_bedtime ? ` (bedtime ${today.sleep_bedtime})` : ""}
- Mood: ${today.mood}/5
- Energy: ${today.energy}/10
- Activity: ${today.activity}
- Nutrition: ${today.nutrition}
- Note: ${today.note || "(none)"}
- Frame: ${today.generated_frame ?? "(not generated yet)"}

## Last 7 days
${last7 || "(no history)"}

## Last 30 days
${last30 || "(limited history)"}

## Statistical summary
${avgText}
${trendText}

## Instructions
Generate 3–5 insights. Each insight must be specific to THIS user's actual data and history. Never output generic advice.

Use these insight types:
- "recovery" — sleep, rest, fatigue, overtraining
- "focus" — productivity, attention, deep work
- "energy" — vitality, motivation, capacity
- "nutrition" — food, hydration, eating patterns
- "pattern" — behavioral trends, recurring habits, changes over time

Each insight must include:
- "title": Short specific title (3–7 words)
- "body": One actionable sentence grounded in the user's actual data
- "type": One of the types above
- "priority": "high" if urgent or strongly patterned, "medium" for standard, "low" for minor
- "confidence": 0.0–1.0 reflecting how confident you are based on data volume (more data = higher confidence)

## Rules
- Reference specific numbers from the user's history ("3rd day under 6h sleep", "energy dropped 3 points this week")
- Use "pattern" type when you identify a multi-day trend
- If today's note mentions intent, reflect on whether past patterns support or challenge that intent
- Never repeat the same insight across multiple cards
- Return ONLY a JSON object with this structure:
{
  "insights": [
    {
      "title": "...",
      "body": "...",
      "type": "recovery|focus|energy|nutrition|pattern",
      "priority": "high|medium|low",
      "confidence": 0.8
    }
  ]
}`;
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
    console.error("[generate-insights] OPENAI_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "AI service is not configured." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    const { today, recent7, recent30 } = await req.json();

    if (!today || typeof today.sleep_hours !== "number") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const allEntries = [...(recent7 || []), ...(recent30 || [])];
    const uniqueEntries = allEntries.filter(
      (e, i, arr) => arr.findIndex((x) => x.entry_date === e.entry_date) === i
    );
    const weekEntries = uniqueEntries.filter(
      (e) => e.entry_date !== today.entry_date
    ).slice(0, 7);
    const monthEntries = uniqueEntries.filter(
      (e) => e.entry_date !== today.entry_date
    ).slice(0, 30);

    const averages = computeAverages(weekEntries);
    const trends = findTrends(weekEntries);

    const prompt = buildInsightPrompt(today, weekEntries, monthEntries, averages, trends);

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
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[generate-insights] OpenAI error ${response.status}:`, errorBody);
      return new Response(
        JSON.stringify({ error: `LLM returned status ${response.status}`, detail: errorBody }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[generate-insights] Empty LLM response:", completion);
      return new Response(
        JSON.stringify({ error: "LLM returned empty response" }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    let parsed: { insights: Insight[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("[generate-insights] Failed to parse LLM output:", content);
      return new Response(
        JSON.stringify({ error: "LLM returned invalid JSON", raw: content }),
        { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const validTypes = ["recovery", "focus", "energy", "nutrition", "pattern"];
    const validPriorities = ["high", "medium", "low"];

    const insights: Insight[] = Array.isArray(parsed.insights)
      ? parsed.insights
          .filter(
            (i: any) =>
              i &&
              typeof i.title === "string" &&
              typeof i.body === "string" &&
              validTypes.includes(i.type) &&
              validPriorities.includes(i.priority) &&
              typeof i.confidence === "number"
          )
          .map((i: any) => ({
            title: String(i.title).trim(),
            body: String(i.body).trim(),
            type: i.type as Insight["type"],
            priority: i.priority as Insight["priority"],
            confidence: Math.min(1, Math.max(0, Number(i.confidence))),
          }))
          .slice(0, 5)
      : [];

    console.log(`[generate-insights] Generated ${insights.length} insights`);

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[generate-insights] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal error in generate-insights",
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
