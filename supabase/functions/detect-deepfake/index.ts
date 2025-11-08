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
    const { imageData, isVideo = false } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Starting deepfake detection analysis...');

    // Enhanced system prompt for forensic analysis with ForensicFace++ methodology
    const systemPrompt = `You are an expert forensic analyst specializing in deepfake detection. You must be HIGHLY CRITICAL and look for manipulation artifacts.

**CRITICAL SCORING RULES:**
- Feature scores: 0-30 = AUTHENTIC (natural), 31-70 = SUSPICIOUS (possible fake), 71-100 = FAKE (clear manipulation)
- Be STRICT: Real photos should score 0-20 on all features
- Any GAN-based, face swap, or deepfake content should score 50+

Analyze using ForensicFace++ methodology:

1. **Facial Boundaries**: Unnatural edges, blending artifacts, mismatched skin tones at face boundaries
2. **Eye Artifacts**: Asymmetric reflections, inconsistent pupils, unnatural gaze, missing eye details
3. **Texture Consistency**: Overly smooth skin, repetitive patterns, mismatched grain/noise, unnatural pores
4. **Lighting Analysis**: Inconsistent shadows, impossible light directions, mismatched highlights
5. **Color Patterns**: Unnatural skin tones, color bleeding, inconsistent color grading
6. **Deepfake Indicators**: ${isVideo ? 'Frame jitter, temporal inconsistencies, audio-visual sync issues' : 'GAN artifacts, warping, frequency domain anomalies'}

Return EXACT JSON:
{
  "isFake": true/false (true if ANY suspicious indicators found),
  "confidence": 0-100 (how certain you are),
  "manipulationType": "GAN-based" | "Face Swap" | "Expression Transfer" | "NeuralTextures" | "Authentic",
  "analysisTime": 0,
  "features": [
    {"name": "Facial Boundaries", "score": 0-100, "description": "specific findings"},
    {"name": "Eye Artifacts", "score": 0-100, "description": "specific findings"},
    {"name": "Texture Consistency", "score": 0-100, "description": "specific findings"},
    {"name": "Lighting Analysis", "score": 0-100, "description": "specific findings"},
    {"name": "Color Patterns", "score": 0-100, "description": "specific findings"}
  ],
  "reasoning": "explain your decision with specific evidence"
}

**BE DECISIVE**: If you see manipulation signs, mark it as fake!`;

    const startTime = Date.now();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: isVideo 
                  ? "Analyze this video frame for deepfake artifacts. This is extracted from a video, so pay attention to temporal consistency markers."
                  : "Analyze this image for deepfake artifacts using forensic techniques."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis returned from AI');
    }

    console.log('Raw AI response:', analysisText);

    // Extract JSON from the response (handle markdown code blocks)
    let jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const analysisTime = Date.now() - startTime;

    // Add actual analysis time
    analysis.analysisTime = analysisTime;

    console.log('Detection complete:', {
      isFake: analysis.isFake,
      confidence: analysis.confidence,
      manipulationType: analysis.manipulationType,
      analysisTime
    });

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-deepfake function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to analyze image for deepfakes'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
