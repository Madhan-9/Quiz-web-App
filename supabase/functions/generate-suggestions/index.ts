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
    const { subject, chapter, difficulty, wrongAnswers } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze wrong answers to identify weak topics
    const wrongQuestions = wrongAnswers.map((item: any) => 
      `Question: ${item.question}\nYour Answer: ${item.userAnswer || "Not answered"}\nCorrect Answer: ${item.correctAnswer}`
    ).join("\n\n");

    const prompt = `You are an educational AI assistant. A student just completed a ${difficulty} level ${subject} quiz on the chapter "${chapter}" and got ${wrongAnswers.length} questions wrong.

Here are the questions they got wrong:
${wrongQuestions}

Based on these wrong answers, provide:
1. Identify 2-3 specific weak topics or concepts the student needs to improve
2. For each weak topic, provide:
   - A brief explanation of why this is important
   - 2-3 practical study techniques or tips
   - Recommended resources (websites, videos, practice methods)

Keep your response encouraging and constructive. Format your response as JSON with this structure:
{
  "weakTopics": [
    {
      "topic": "Topic name",
      "explanation": "Why this is important",
      "techniques": ["Technique 1", "Technique 2"],
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "encouragement": "A brief encouraging message"
}`;

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
            content: "You are an educational AI that provides constructive feedback and study suggestions. Always respond with valid JSON." 
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No suggestions generated");
    }

    // Parse the JSON response
    let suggestions;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[1]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse suggestions");
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate suggestions" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
