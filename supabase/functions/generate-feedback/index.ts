import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { score, subject, chapter, difficulty, totalQuestions } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const correctAnswers = Math.round((score / 100) * totalQuestions);
    const wrongAnswers = totalQuestions - correctAnswers;

    const prompt = `You are an educational AI assistant. A student just completed a ${difficulty} level ${subject} quiz on "${chapter}" with the following results:
- Total Questions: ${totalQuestions}
- Correct Answers: ${correctAnswers}
- Wrong Answers: ${wrongAnswers}
- Score: ${score}%

Provide encouraging and constructive feedback (2-3 sentences) that:
1. Acknowledges their effort
2. Comments on their performance level
3. Provides motivation and next steps

Keep the tone positive and supportive. For scores above 80%, emphasize their excellence. For scores 60-80%, encourage continued practice. For scores below 60%, provide reassurance and actionable advice.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an encouraging educational AI that provides constructive feedback to students. Keep responses concise and motivating." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await aiResponse.json();
    const feedbackText = data.choices?.[0]?.message?.content;

    if (!feedbackText) {
      throw new Error("No feedback generated");
    }

    return new Response(JSON.stringify({ feedback: feedbackText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating feedback:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate feedback" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
