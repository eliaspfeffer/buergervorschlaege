const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Analysiere einen Vorschlag und gib Ähnlichkeiten, Bewertung und Empfehlungen zurück
router.get("/proposals/:proposalId/analyze", aiController.analyzeNewProposal);

// Führe ähnliche Vorschläge zu einem neuen zusammen
router.post("/proposals/:sourceProposalId/merge", aiController.mergeProposals);

// Abrufen der KI-Analyse eines Vorschlags
router.get("/proposals/:proposalId/analysis", aiController.getProposalAnalysis);

// Führe eine Neubewertung eines Vorschlags durch
router.post("/proposals/:proposalId/evaluate", aiController.reevaluateProposal);

// Top-Vorschläge basierend auf KI-Bewertungen abrufen
router.get("/proposals/top", aiController.getTopProposals);

// Batch-Verarbeitung - Analysiere alle unverarbeiteten Vorschläge
router.post(
  "/proposals/process-unanalyzed",
  aiController.processUnanalyzedProposals
);

// Automatische Zusammenführung von ähnlichen Vorschlägen
router.post("/proposals/auto-merge", aiController.autoMergeProposals);

module.exports = router;
