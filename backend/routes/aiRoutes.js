const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Analysiere einen Vorschlag und gib Ähnlichkeiten, Bewertung und Empfehlungen zurück
router.get("/proposals/:proposalId/analyze", aiController.analyzeNewProposal);

// On-Demand-Analyse für einen Vorschlag durchführen (POST für direkte Analyse-Anforderung)
router.post("/proposals/:proposalId/analyze", aiController.analyzeNewProposal);

// Vorschläge zusammenführen
router.post("/proposals/:proposalId/merge", aiController.mergeProposals);

// Abrufen der KI-Analyse eines Vorschlags
router.get("/proposals/:proposalId/analysis", aiController.getProposalAnalysis);

// Führe eine Neubewertung eines Vorschlags durch
router.post("/proposals/:proposalId/evaluate", aiController.reevaluateProposal);

// Analysiere eine Zusammenfassung eines Vorschlags und bewerte die Qualitätskriterien
router.post(
  "/proposals/:proposalId/analyze-summary",
  aiController.analyzeProposalSummary
);

// Hole die Analyse-Werte einer Zusammenfassung eines Vorschlags
router.get(
  "/proposals/:proposalId/analyze-summary",
  aiController.getProposalAnalysis
);

// Top-Vorschläge basierend auf KI-Bewertungen abrufen
router.get("/proposals/top", aiController.getTopProposals);

// Verarbeite unanalysierte Vorschläge im Hintergrund
router.post(
  "/proposals/process-unanalyzed",
  aiController.processUnanalyzedProposals
);

// Entferne verwaiste Analysen (ohne zugehörigen Vorschlag)
router.post("/cleanup/orphaned-analyses", aiController.pruneOrphanedAnalyses);

// Automatische Zusammenführung von ähnlichen Vorschlägen
router.post("/proposals/auto-merge", aiController.autoMergeProposals);

// Analysiere und führe einen neuen Vorschlag bei Bedarf automatisch zusammen
router.post(
  "/proposals/:proposalId/auto-analyze",
  aiController.autoAnalyzeProposal
);

module.exports = router;
