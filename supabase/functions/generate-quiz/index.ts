import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, chapter, difficulty } = await req.json();
    
    const isComputerSubject = subject === "computer";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt;
    
    if (isComputerSubject) {
      prompt = `You are an educational AI. Generate 10 random basic multiple choice questions for a ${difficulty} level Computer Science quiz.

Cover topics like:
- Basic programming concepts
- Computer hardware and software
- Internet and networking basics
- Operating systems
- Data structures (basic)
- Algorithms (basic)
- Computer terminology

Each question should have:
- A clear question
- 4 options (labeled A, B, C, D)
- One correct answer
- A brief explanation

Format your response as a JSON array of objects with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact correct option text",
    "explanation": "Brief explanation of the answer"
  }
]

Make sure:
1. Questions cover various computer science topics
2. Questions match the ${difficulty} difficulty level
3. All options are plausible
4. Explanations are clear and educational
5. Response is valid JSON only (no markdown formatting)
6. Generate different questions each time (vary the topics and questions)`;
    } else {
      prompt = `You are an educational AI. Generate 10 multiple choice questions for a ${difficulty} level ${subject} quiz on the chapter "${chapter}".

IMPORTANT: The questions MUST be specifically about the chapter "${chapter}". Do NOT include questions from other chapters or general ${subject} questions.

Each question should have:
- A clear question
- 4 options (labeled A, B, C, D)
- One correct answer
- A brief explanation

Format your response as a JSON array of objects with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact correct option text",
    "explanation": "Brief explanation of the answer"
  }
]

Make sure:
1. Questions are directly related to the chapter "${chapter}"
2. Questions match the ${difficulty} difficulty level
3. All options are plausible
4. Explanations are clear and educational
5. Response is valid JSON only (no markdown formatting)
6. Vary the questions each time to avoid repetition`;
    }

    console.log("Generating quiz questions for:", subject, difficulty);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert educator who creates high-quality quiz questions. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw AI response:", content);

    // Parse the JSON response
    let questions;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : content;
      questions = JSON.parse(jsonText.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Invalid response format from AI");
    }

    if (!Array.isArray(questions) || questions.length !== 10) {
      throw new Error("AI did not generate exactly 10 questions");
    }

    console.log("Successfully generated", questions.length, "questions");

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
