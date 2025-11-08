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

    // Enhanced system prompt for forensic analysis
    const systemPrompt = `You are an expert forensic analyst specializing in deepfake detection using the ForensicFace++ methodology. 

Analyze the provided image for signs of manipulation using these forensic techniques:

1. **Facial Inconsistencies**: Check for unnatural facial features, asymmetry, blending artifacts around face boundaries
2. **Eye Analysis**: Examine iris reflections, pupil consistency, unnatural eye movements or gaze direction
3. **Texture Analysis**: Look for pixel-level artifacts, noise patterns, compression artifacts that differ across regions
4. **Lighting & Shadows**: Verify consistency of lighting direction, shadow placement, and highlights
5. **Edge Detection**: Check for blurred or inconsistent edges around facial features
6. **Color Analysis**: Examine skin tone consistency, color gradients, unnatural color patches
7. **Temporal Artifacts**: ${isVideo ? 'Check for frame-to-frame inconsistencies, jitter, or unnatural transitions' : 'Not applicable for single images'}

Provide your analysis in this EXACT JSON format:
{
  "isFake": true/false,
  "confidence": 0-100,
  "manipulationType": "GAN-based" | "Face Swap" | "Expression Transfer" | "Audio Sync" | "Authentic",
  "analysisTime": time in ms,
  "features": [
    {"name": "Facial Boundaries", "score": 0-100, "description": "brief analysis"},
    {"name": "Eye Artifacts", "score": 0-100, "description": "brief analysis"},
    {"name": "Texture Consistency", "score": 0-100, "description": "brief analysis"},
    {"name": "Lighting Analysis", "score": 0-100, "description": "brief analysis"},
    {"name": "Color Patterns", "score": 0-100, "description": "brief analysis"}
  ],
  "reasoning": "detailed explanation of detection decision"
}

Be thorough and accurate. Higher feature scores indicate more suspicious artifacts (higher likelihood of manipulation).`;

    const startTime = Date.now();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
