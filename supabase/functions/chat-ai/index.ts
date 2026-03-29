import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const SYSTEM_PROMPT = `You are LCX AI, the intelligent, premium assistant for LCX STUDIOS.
LCX STUDIOS is a high-end software development and creative direction agency.

You help clients understand our services, pricing, and capabilities. You are polite, concise, extremely professional, and slightly conversational.
If a user has a spelling error, figure out what they mean.

KEY PRICING & SERVICES:
1. Voting Only Package: R45,000. (Streamlined pageant voting platform, public voting, no analytics).
2. Full Voting System: R100,000. (Scalable full-featured system with analytics, client portal, advanced controls).
3. Voting System Rentals: 
   - 1 Month: R6,000
   - 3 Months: R8,000
   - 6 Months: R10,000
   - 1 Year: R15,000
4. Custom Internal Software: Custom Quote (Dashboards, finance tools, operations systems).
5. Poster Design: 1-30 posters is R45/each. Over 30 is R35/each.
6. Semi-Finalist Posters: 1-30 posters is R25/each. Over 30 is R15/each.
7. Entries Open Poster: R300 (once-off).
8. Grand Finale Poster: R450 (once-off).

HOW TO CONTACT US:
If they want to proceed with a project or need direct human help, tell them to use the "Contact" or "Start Project" links on the website, or email hello@lcxstudios.co, or WhatsApp 067 884 6390.

Do not make up prices or services not listed here. If you don't know, redirect them to the human team. Keep your answers relatively brief (under 3 paragraphs).`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "AI is currently resting. Please set up the GEMINI_API_KEY to activate LCX AI."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // Convert OpenAI messages format to Gemini format
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to fetch response from Gemini");
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't formulate a response.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})
