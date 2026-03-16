const express = require("express");
const router = express.Router();

const { analyzeSymptoms } = require("../controllers/symptomControllers");

/**
 * POST /api/symptom-analysis
 * Analyzes user symptoms using Ollama AI
 * Body: { symptoms, duration, severity }
 * Returns: { success, data: { possibleConditions, recommendedActions, urgencyLevel, disclaimer } }
 */
router.post("/", analyzeSymptoms);

module.exports = router;
