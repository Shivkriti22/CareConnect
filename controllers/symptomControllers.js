/**
 * Symptom Analysis Controller
 * Integrates with local Ollama API to analyze user symptoms
 */

const analyzeSymptoms = async (req, res) => {
  console.log('>>> Symptom analysis route hit')
  try {
    const { symptoms, duration, severity } = req.body;

    console.log('>>> Request body:', req.body)
    console.log('>>> Symptoms:', symptoms)
    console.log('>>> Duration:', duration)
    console.log('>>> Severity:', severity)

    // Validate input
    if (!symptoms || !symptoms.trim()) {
      console.log("Validation failed: symptoms missing");
      return res.status(400).json({
        success: false,
        message: "Symptoms field is required"
      });
    }

    if (!duration) {
      return res.status(400).json({
        success: false,
        message: "Duration field is required"
      });
    }

    if (!severity) {
      return res.status(400).json({
        success: false,
        message: "Severity field is required"
      });
    }

    // Build structured medical prompt for Ollama
    // The prompt guides the model to return only JSON without markdown or explanations
    const severityMap = {
      '1': 'Mild',
      '2': 'Moderate',
      '3': 'Moderate-Severe',
      '4': 'Severe',
      '5': 'Extreme'
    };

    const prompt = `You are a concise medical symptom analyzer. Return ONLY JSON, no text before or after.

PATIENT REPORT:
- Symptoms: ${symptoms}
- Duration: ${duration}
- Severity: ${severityMap[severity] || 'Unknown'} (${severity}/5)

OUTPUT THIS JSON STRUCTURE EXACTLY:
{
  "possibleConditions": [
    {
      "name": "condition name",
      "likelihood": "High",
      "description": "one sentence specific to the reported symptoms"
    },
    {
      "name": "condition name",
      "likelihood": "Medium",
      "description": "one sentence specific to the reported symptoms"
    },
    {
      "name": "condition name",
      "likelihood": "Low",
      "description": "one sentence specific to the reported symptoms"
    }
  ],
  "recommendedActions": [
    "action 1",
    "action 2",
    "action 3"
  ],
  "urgencyLevel": "Moderate"
}

RULES:
- possibleConditions: exactly 3 items only
- likelihood: must be "High", "Medium", or "Low" only
- description: one sentence, be specific to the reported symptoms
- recommendedActions: 3-5 specific, practical steps
- urgencyLevel: "Emergency", "Urgent", "Moderate", or "Low"
- Start output with { and end with }
- No markdown, no code blocks, no explanations`;

    // Call Ollama API with simple Promise-based timeout
    console.log('>>> Calling Ollama with prompt length:', prompt.length)
    const ollamaPromise = fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:1b", // Using the installed model
        prompt: prompt,
        stream: false
      })
    });

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Ollama request timeout')), 60000)
    );

    let ollamaResponse;
    try {
      console.log('>>> Sending request to Ollama...');
      ollamaResponse = await Promise.race([ollamaPromise, timeoutPromise]);
      console.log('>>> Ollama responded with status:', ollamaResponse.status);
    } catch (error) {
      console.error('>>> Ollama fetch error:', error);
      console.error('>>> Error details:', error.message);
      return res.status(503).json({
        success: false,
        message: error.message.includes('timeout')
          ? 'AI service timeout. Please try again.'
          : 'AI service unavailable. Please ensure Ollama is running locally on http://localhost:11434'
      });
    }

    if (!ollamaResponse.ok) {
      console.error("Ollama response not ok:", ollamaResponse.status);
      return res.status(503).json({
        success: false,
        message: "AI service unavailable. Please ensure Ollama is running locally on http://localhost:11434"
      });
    }

    const ollamaData = await ollamaResponse.json();
    console.log('>>> Ollama raw response:', ollamaData);
    const modelOutput = ollamaData.response || "";

    // Parse the JSON response from Ollama
    let analysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = modelOutput.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      // Fallback: return structured response with the raw output
      console.error("Failed to parse Ollama JSON response:", parseError);
      analysis = {
        possibleConditions: [
          {
            name: "Analysis Failed",
            likelihood: "Low",
            description: "Unable to parse AI response. Please try again."
          }
        ],
        recommendedActions: [
          "Consult a healthcare professional",
          "Ensure Ollama is running and the model is loaded"
        ],
        urgencyLevel: "Moderate"
      };
    }

    // Validate the analysis structure
    if (!analysis.possibleConditions || !Array.isArray(analysis.possibleConditions)) {
      analysis.possibleConditions = [];
    }
    if (!analysis.recommendedActions || !Array.isArray(analysis.recommendedActions)) {
      analysis.recommendedActions = [];
    }
    if (!analysis.urgencyLevel) {
      analysis.urgencyLevel = "Moderate";
    }

    console.log('>>> Sending result to frontend')
    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error("Symptom analysis error:", error);

    // Distinguish between Ollama unavailable and other errors
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        message: "AI service unavailable. Please ensure Ollama is running locally on http://localhost:11434"
      });
    }

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: "AI service timeout. Please try again."
      });
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while analyzing symptoms"
    });
  }
};

module.exports = {
  analyzeSymptoms
};
