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

    const prompt = `You are a medical symptom analyzer AI. A user has reported the following symptoms:

Symptoms: ${symptoms}
Duration: ${duration}
Severity Level: ${severityMap[severity] || 'Unknown'} (${severity}/5)

Based on these symptoms, provide ONLY a JSON object response (no markdown, no code blocks, no explanations). The JSON must include:
- possibleConditions: Array of objects with name (string), likelihood ("High"|"Medium"|"Low"), and description (string)
- recommendedActions: Array of strings with actionable recommendations
- urgencyLevel: One of "Emergency", "Urgent", "Moderate", or "Low"
- disclaimer: A medical disclaimer string

Return ONLY valid JSON, starting with { and ending with }. Do not include markdown formatting.`;

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
        urgencyLevel: "Moderate",
        disclaimer: "This analysis could not be completed properly. Please seek professional medical advice."
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
    if (!analysis.disclaimer) {
      analysis.disclaimer = "This analysis is for informational purposes only and does not replace professional medical advice.";
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
