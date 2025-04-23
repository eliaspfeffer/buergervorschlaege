const { Proposal, Category, ProposalAnalysis, Comment } = require("../models");
const geminiService = require("../services/geminiService");

/**
 * Analysiert einen neuen Vorschlag auf Ähnlichkeiten und gibt Empfehlungen
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const analyzeNewProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Vorschlag aus der Datenbank holen
    const proposal = await Proposal.findById(proposalId)
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    if (!proposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    // Prüfen, ob dieser Vorschlag bereits analysiert wurde
    const existingAnalysis = await ProposalAnalysis.findOne({
      proposal: proposalId,
    });

    if (existingAnalysis && existingAnalysis.isProcessed) {
      return res.status(200).json({
        message: "Vorschlag wurde bereits analysiert",
        analysis: existingAnalysis,
      });
    }

    // Bestehende Vorschläge zum Vergleich aus der Datenbank holen (exklusive des aktuellen Vorschlags)
    const existingProposals = await Proposal.find({
      _id: { $ne: proposalId },
      status: { $nin: ["deleted", "rejected"] },
    })
      .limit(10) // Beschränkung auf 10 Vorschläge für Performanz
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    // Gemini API zur Analyse der Ähnlichkeit nutzen
    const similarityAnalysis = await geminiService.analyzeProposalSimilarity(
      proposal,
      existingProposals
    );

    // Bewertung des Vorschlags mit Gemini API
    const evaluation = await geminiService.evaluateProposal(proposal);

    // Kategorienvorschläge von Gemini API holen
    const categories = await Category.find({ isActive: true });
    const categorySuggestions = await geminiService.suggestCategories(
      proposal,
      categories
    );

    // Ähnliche Vorschläge IDs und Empfehlungen speichern
    const similarProposalRefs = [];
    if (
      similarityAnalysis.isSimilar &&
      similarityAnalysis.similarProposals &&
      similarityAnalysis.similarProposals.length > 0
    ) {
      // Referenzen auf ähnliche Vorschläge speichern
      for (const similar of similarityAnalysis.similarProposals) {
        similarProposalRefs.push({
          proposal: similar.id,
          similarityScore: similar.similarityScore,
          reason: similar.reason,
        });
      }
    }

    // Kategorienvorschläge formatieren
    const suggestedCategoryRefs = [];
    if (
      categorySuggestions.suggestedCategories &&
      categorySuggestions.suggestedCategories.length > 0
    ) {
      for (const suggestion of categorySuggestions.suggestedCategories) {
        // Kategorie-ID anhand des Namens finden
        const category = categories.find(
          (c) => c.name === suggestion.categoryName
        );
        if (category) {
          suggestedCategoryRefs.push({
            category: category._id,
            confidence: suggestion.confidence,
            reason: suggestion.reason,
          });
        }
      }
    }

    // Analyse in der Datenbank speichern oder aktualisieren
    let analysis;
    if (existingAnalysis) {
      // Bestehende Analyse aktualisieren
      analysis = await ProposalAnalysis.findOneAndUpdate(
        { proposal: proposalId },
        {
          similarProposals: similarProposalRefs,
          isMerged: false,
          mergeSource: false,
          mergeStrategy: similarityAnalysis.mergeStrategy,
          aiEvaluation: {
            quality: evaluation.quality,
            relevance: evaluation.relevance,
            feasibility: evaluation.feasibility,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            summary: evaluation.summary,
          },
          suggestedCategories: suggestedCategoryRefs,
          isProcessed: true,
          lastProcessedAt: new Date(),
        },
        { new: true }
      ).populate({
        path: "similarProposals.proposal",
        select: "title content",
      });
    } else {
      // Neue Analyse erstellen
      analysis = await ProposalAnalysis.create({
        proposal: proposalId,
        similarProposals: similarProposalRefs,
        mergeStrategy: similarityAnalysis.mergeStrategy,
        aiEvaluation: {
          quality: evaluation.quality,
          relevance: evaluation.relevance,
          feasibility: evaluation.feasibility,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          summary: evaluation.summary,
        },
        suggestedCategories: suggestedCategoryRefs,
        isProcessed: true,
        lastProcessedAt: new Date(),
      });

      // Ähnliche Vorschläge für Antwort laden
      analysis = await ProposalAnalysis.findById(analysis._id).populate({
        path: "similarProposals.proposal",
        select: "title content",
      });
    }

    // AI-Analyse auch im Vorschlag selbst speichern
    await Proposal.findByIdAndUpdate(proposalId, {
      aiAnalysis: {
        quality: evaluation.quality,
        relevance: evaluation.relevance,
        feasibility: evaluation.feasibility,
        keywords: evaluation.keywords || [],
      },
    });

    return res.status(200).json({
      message: "Vorschlag erfolgreich analysiert",
      analysis,
      similarityAnalysis,
      recommendation: similarityAnalysis.recommendation,
    });
  } catch (error) {
    console.error("Fehler bei der Analyse des Vorschlags:", error);
    return res.status(500).json({
      message: "Fehler bei der Analyse des Vorschlags",
      error: error.message,
    });
  }
};

/**
 * Führt ähnliche Vorschläge zu einem neuen zusammen
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const mergeProposals = async (req, res) => {
  try {
    const { sourceProposalId } = req.params;
    const { targetProposalIds } = req.body;

    if (
      !targetProposalIds ||
      !Array.isArray(targetProposalIds) ||
      targetProposalIds.length === 0
    ) {
      return res.status(400).json({
        message: "Keine Ziel-Vorschläge zum Zusammenführen angegeben",
      });
    }

    // Quell-Vorschlag holen
    const sourceProposal = await Proposal.findById(sourceProposalId);
    if (!sourceProposal) {
      return res
        .status(404)
        .json({ message: "Quell-Vorschlag nicht gefunden" });
    }

    // Ziel-Vorschläge holen
    const targetProposals = await Proposal.find({
      _id: { $in: targetProposalIds },
    });

    if (targetProposals.length !== targetProposalIds.length) {
      return res.status(404).json({
        message: "Nicht alle angegebenen Ziel-Vorschläge wurden gefunden",
      });
    }

    // Gemini API zum Zusammenführen der Vorschläge nutzen
    const mergeResult = await geminiService.mergeProposals(
      sourceProposal,
      targetProposals
    );

    // Neuen zusammengeführten Vorschlag erstellen
    const mergedProposal = new Proposal({
      title: mergeResult.title,
      content: mergeResult.content,
      status: "submitted",
      user: sourceProposal.user, // Der ursprüngliche Autor wird beibehalten
      categories: sourceProposal.categories, // Kategorien vom Ursprungsvorschlag übernehmen (kann später angepasst werden)
      ministries: sourceProposal.ministries, // Ministerien vom Ursprungsvorschlag übernehmen (kann später angepasst werden)
      isMerged: false, // Ist das Ergebnis einer Zusammenführung, aber selbst nicht zusammengeführt
      mergeSource: false, // Ist nicht die Quelle einer Zusammenführung
      mergeParents: [sourceProposalId, ...targetProposalIds], // Speichert die Quell-IDs
    });

    const savedMergedProposal = await mergedProposal.save();

    // Analyse für den neuen zusammengeführten Vorschlag erstellen
    const mergedAnalysis = new ProposalAnalysis({
      proposal: savedMergedProposal._id,
      isMerged: false,
      mergeSource: false,
      mergeRationale: mergeResult.mergeRationale,
      isProcessed: true,
      lastProcessedAt: new Date(),
    });

    await mergedAnalysis.save();

    // IDs der zusammengeführten Vorschläge
    const sourceIds = [sourceProposalId, ...targetProposalIds];

    // Aktualisiere Kommentare auf den neuen zusammengeführten Vorschlag
    await Comment.updateMany(
      { proposal: { $in: sourceIds } },
      { proposal: savedMergedProposal._id }
    );

    // Lösche die alten Vorschläge und deren Analysen
    await Promise.all([
      Proposal.deleteMany({ _id: { $in: sourceIds } }),
      ProposalAnalysis.deleteMany({ proposal: { $in: sourceIds } }),
    ]);

    return res.status(201).json({
      message: "Vorschläge erfolgreich zusammengeführt",
      mergedProposal: savedMergedProposal,
      sourceProposalId,
      targetProposalIds,
      mergeRationale: mergeResult.mergeRationale,
    });
  } catch (error) {
    console.error("Fehler beim Zusammenführen der Vorschläge:", error);
    return res.status(500).json({
      message: "Fehler beim Zusammenführen der Vorschläge",
      error: error.message,
    });
  }
};

/**
 * Ruft die KI-Analyse für einen bestimmten Vorschlag ab
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const getProposalAnalysis = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Analyse aus der Datenbank holen
    const analysis = await ProposalAnalysis.findOne({ proposal: proposalId })
      .populate({
        path: "similarProposals.proposal",
        select: "title content",
      })
      .populate({
        path: "suggestedCategories.category",
        select: "name description",
      });

    if (!analysis) {
      return res
        .status(404)
        .json({ message: "Keine Analyse für diesen Vorschlag gefunden" });
    }

    return res.status(200).json({
      message: "Analyse erfolgreich abgerufen",
      analysis,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Analyse:", error);
    return res.status(500).json({
      message: "Fehler beim Abrufen der Analyse",
      error: error.message,
    });
  }
};

/**
 * Führt eine neue Bewertung eines Vorschlags durch
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const reevaluateProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Vorschlag aus der Datenbank holen
    const proposal = await Proposal.findById(proposalId)
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    if (!proposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    // Bewertung des Vorschlags mit Gemini API
    const evaluation = await geminiService.evaluateProposal(proposal);

    // Bestehende Analyse aktualisieren oder neue erstellen
    const updatedAnalysis = await ProposalAnalysis.findOneAndUpdate(
      { proposal: proposalId },
      {
        aiEvaluation: {
          quality: evaluation.quality,
          relevance: evaluation.relevance,
          feasibility: evaluation.feasibility,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          summary: evaluation.summary,
        },
        lastProcessedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // AI-Analyse auch im Vorschlag selbst aktualisieren
    await Proposal.findByIdAndUpdate(proposalId, {
      aiAnalysis: {
        quality: evaluation.quality,
        relevance: evaluation.relevance,
        feasibility: evaluation.feasibility,
        keywords: evaluation.keywords || [],
      },
    });

    return res.status(200).json({
      message: "Vorschlag erfolgreich neu bewertet",
      analysis: updatedAnalysis,
    });
  } catch (error) {
    console.error("Fehler bei der Neubewertung des Vorschlags:", error);
    return res.status(500).json({
      message: "Fehler bei der Neubewertung des Vorschlags",
      error: error.message,
    });
  }
};

/**
 * Ruft Top-Vorschläge basierend auf KI-Bewertungen ab
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const getTopProposals = async (req, res) => {
  try {
    const { limit = 10, metric = "combined" } = req.query;

    let sortField = {};

    // Sortierfeld basierend auf dem angeforderten Metrik festlegen
    switch (metric) {
      case "quality":
        sortField = { "aiAnalysis.quality": -1 };
        break;
      case "relevance":
        sortField = { "aiAnalysis.relevance": -1 };
        break;
      case "feasibility":
        sortField = { "aiAnalysis.feasibility": -1 };
        break;
      case "combined":
      default:
        // Kombinierte Bewertung aus allen drei Faktoren
        sortField = {
          "aiAnalysis.combinedScore": -1,
        };
        break;
    }

    // Erweiterte Aggregation für kombinierte Bewertung
    const pipeline = [
      {
        $match: {
          // Nur Vorschläge berücksichtigen, die nicht zusammengeführt wurden und aktiv sind
          mergeSource: { $ne: true },
          status: { $nin: ["deleted", "rejected", "merged"] },
          "aiAnalysis.quality": { $exists: true },
        },
      },
      {
        $addFields: {
          "aiAnalysis.combinedScore": {
            $avg: [
              "$aiAnalysis.quality",
              "$aiAnalysis.relevance",
              "$aiAnalysis.feasibility",
            ],
          },
        },
      },
      {
        $sort: sortField,
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categories.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "ministries",
          localField: "ministries.ministry",
          foreignField: "_id",
          as: "ministryData",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          status: 1,
          createdAt: 1,
          aiAnalysis: 1,
          user: { $arrayElemAt: ["$userData", 0] },
          categories: "$categoryData",
          ministries: "$ministryData",
        },
      },
    ];

    const topProposals = await Proposal.aggregate(pipeline);

    return res.status(200).json({
      topProposals,
      metric,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Top-Vorschläge:", error);
    return res.status(500).json({
      message: "Fehler beim Abrufen der Top-Vorschläge",
      error: error.message,
    });
  }
};

// Batch-Prozess für die Analyse aller unverarbeiteten Vorschläge
const processUnanalyzedProposals = async (req, res) => {
  try {
    // Unverarbeitete Vorschläge finden (ohne bestehende Analyse oder ohne isProcessed)
    const unprocessedProposals = await Proposal.find({
      $or: [
        { aiAnalysis: { $exists: false } },
        { "aiAnalysis.quality": { $exists: false } },
      ],
      status: { $nin: ["deleted", "rejected", "merged"] },
    }).limit(5); // Beschränkung auf 5 Vorschläge für Performanz

    if (unprocessedProposals.length === 0) {
      return res.status(200).json({
        message: "Keine unverarbeiteten Vorschläge gefunden",
        processedCount: 0,
      });
    }

    // Vorschläge nacheinander verarbeiten
    const processedResults = [];
    for (const proposal of unprocessedProposals) {
      try {
        // Bestehende Vorschläge zum Vergleich holen
        const existingProposals = await Proposal.find({
          _id: { $ne: proposal._id },
          status: { $nin: ["deleted", "rejected", "merged"] },
        })
          .limit(10)
          .populate("categories.category", "name")
          .populate("ministries.ministry", "name");

        // Gemini API zur Analyse der Ähnlichkeit nutzen
        const similarityAnalysis =
          await geminiService.analyzeProposalSimilarity(
            proposal,
            existingProposals
          );

        // Bewertung des Vorschlags
        const evaluation = await geminiService.evaluateProposal(proposal);

        // Kategorienvorschläge
        const categories = await Category.find({ isActive: true });
        const categorySuggestions = await geminiService.suggestCategories(
          proposal,
          categories
        );

        // Ähnliche Vorschläge IDs und Empfehlungen speichern
        const similarProposalRefs = [];
        if (
          similarityAnalysis.isSimilar &&
          similarityAnalysis.similarProposals &&
          similarityAnalysis.similarProposals.length > 0
        ) {
          for (const similar of similarityAnalysis.similarProposals) {
            similarProposalRefs.push({
              proposal: similar.id,
              similarityScore: similar.similarityScore,
              reason: similar.reason,
            });
          }
        }

        // Kategorienvorschläge formatieren
        const suggestedCategoryRefs = [];
        if (
          categorySuggestions.suggestedCategories &&
          categorySuggestions.suggestedCategories.length > 0
        ) {
          for (const suggestion of categorySuggestions.suggestedCategories) {
            const category = categories.find(
              (c) => c.name === suggestion.categoryName
            );
            if (category) {
              suggestedCategoryRefs.push({
                category: category._id,
                confidence: suggestion.confidence,
                reason: suggestion.reason,
              });
            }
          }
        }

        // Analyse in der Datenbank speichern
        const analysis = await ProposalAnalysis.findOneAndUpdate(
          { proposal: proposal._id },
          {
            proposal: proposal._id,
            similarProposals: similarProposalRefs,
            mergeStrategy: similarityAnalysis.mergeStrategy,
            aiEvaluation: {
              quality: evaluation.quality,
              relevance: evaluation.relevance,
              feasibility: evaluation.feasibility,
              strengths: evaluation.strengths,
              weaknesses: evaluation.weaknesses,
              summary: evaluation.summary,
            },
            suggestedCategories: suggestedCategoryRefs,
            isProcessed: true,
            lastProcessedAt: new Date(),
          },
          { new: true, upsert: true }
        );

        // AI-Analyse auch im Vorschlag selbst speichern
        await Proposal.findByIdAndUpdate(proposal._id, {
          aiAnalysis: {
            quality: evaluation.quality,
            relevance: evaluation.relevance,
            feasibility: evaluation.feasibility,
            keywords: evaluation.keywords || [],
          },
        });

        processedResults.push({
          proposalId: proposal._id,
          success: true,
          analysisId: analysis._id,
          recommendation: similarityAnalysis.recommendation,
        });
      } catch (error) {
        console.error(
          `Fehler bei der Verarbeitung des Vorschlags ${proposal._id}:`,
          error
        );

        processedResults.push({
          proposalId: proposal._id,
          success: false,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      message: "Unverarbeitete Vorschläge wurden analysiert",
      processedCount: processedResults.length,
      processedResults,
    });
  } catch (error) {
    console.error("Fehler bei der Batch-Verarbeitung von Vorschlägen:", error);
    return res.status(500).json({
      message: "Fehler bei der Batch-Verarbeitung von Vorschlägen",
      error: error.message,
    });
  }
};

/**
 * Entfernt verwaiste Analysen (für die kein Vorschlag mehr existiert)
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const pruneOrphanedAnalyses = async (req, res) => {
  try {
    // Alle Vorschlag-IDs ermitteln
    const proposals = await Proposal.find({}, "_id");
    const proposalIds = proposals.map((p) => p._id.toString());

    // Analysen finden, deren Vorschlag nicht mehr existiert
    const analyses = await ProposalAnalysis.find({});
    const orphanedAnalyses = analyses.filter(
      (analysis) => !proposalIds.includes(analysis.proposal.toString())
    );

    if (orphanedAnalyses.length === 0) {
      return res.status(200).json({
        message: "Keine verwaisten Analysen gefunden",
        count: 0,
      });
    }

    // IDs der zu löschenden Analysen sammeln
    const orphanedIds = orphanedAnalyses.map((a) => a._id);

    // Verwaiste Analysen löschen
    await ProposalAnalysis.deleteMany({ _id: { $in: orphanedIds } });

    return res.status(200).json({
      message: "Verwaiste Analysen erfolgreich entfernt",
      count: orphanedIds.length,
      removedIds: orphanedIds,
    });
  } catch (error) {
    console.error("Fehler beim Entfernen verwaister Analysen:", error);
    return res.status(500).json({
      message: "Fehler beim Entfernen verwaister Analysen",
      error: error.message,
    });
  }
};

// Automatische Zusammenführung von ähnlichen Vorschlägen
const autoMergeProposals = async (req, res) => {
  try {
    // Analysen finden, die eine Zusammenführung empfehlen
    const mergeCandidates = await ProposalAnalysis.find({
      "similarProposals.0": { $exists: true }, // Hat ähnliche Vorschläge
      isMerged: false, // Wurde noch nicht zusammengeführt
      mergeSource: false, // Ist keine Quelle einer Zusammenführung
    })
      .populate("proposal", "title content categories ministries user")
      .populate("similarProposals.proposal", "title content _id");

    if (mergeCandidates.length === 0) {
      return res.status(200).json({
        message: "Keine Kandidaten für automatische Zusammenführung gefunden",
        mergeCount: 0,
      });
    }

    const mergeResults = [];
    const deletedProposalIds = [];

    // Jeden Kandidaten verarbeiten
    for (const candidate of mergeCandidates) {
      try {
        // Nur Vorschläge mit hoher Ähnlichkeit (> 0.7) zusammenführen
        const highSimilarityProposals = candidate.similarProposals
          .filter((p) => p.similarityScore > 0.7)
          .map((p) => p.proposal);

        if (highSimilarityProposals.length === 0) {
          continue;
        }

        // Gemini API zum Zusammenführen der Vorschläge nutzen
        const mergeResult = await geminiService.mergeProposals(
          candidate.proposal,
          highSimilarityProposals
        );

        // Neuen zusammengeführten Vorschlag erstellen
        const mergedProposal = new Proposal({
          title: mergeResult.title,
          content: mergeResult.content,
          status: "submitted",
          user: candidate.proposal.user,
          categories: candidate.proposal.categories,
          ministries: candidate.proposal.ministries,
          isMerged: false, // Dieser Vorschlag ist das Endergebnis, also nicht als merged markieren
          mergeSource: false,
          mergeParents: [
            candidate.proposal._id,
            ...highSimilarityProposals.map((p) => p._id),
          ],
        });

        const savedMergedProposal = await mergedProposal.save();

        // IDs der zusammengeführten Vorschläge
        const sourceIds = [
          candidate.proposal._id,
          ...highSimilarityProposals.map((p) => p._id),
        ];

        // Alte Vorschläge und deren Analysen löschen
        await Promise.all([
          Proposal.deleteMany({ _id: { $in: sourceIds } }),
          ProposalAnalysis.deleteMany({ proposal: { $in: sourceIds } }),
          Comment.updateMany(
            { proposal: { $in: sourceIds } },
            { proposal: savedMergedProposal._id }
          ),
        ]);

        // Speichere die gelöschten IDs
        deletedProposalIds.push(...sourceIds);

        mergeResults.push({
          success: true,
          sourceProposals: sourceIds,
          mergedProposalId: savedMergedProposal._id,
          title: mergedProposal.title,
        });

        // Erstelle eine neue Analyse für den zusammengeführten Vorschlag
        const evaluation = await geminiService.evaluateProposal(
          savedMergedProposal
        );

        await ProposalAnalysis.create({
          proposal: savedMergedProposal._id,
          isMerged: false,
          mergeSource: false,
          mergeRationale: mergeResult.mergeRationale,
          aiEvaluation: {
            quality: evaluation.quality,
            relevance: evaluation.relevance,
            feasibility: evaluation.feasibility,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            summary: evaluation.summary,
          },
          isProcessed: true,
          lastProcessedAt: new Date(),
        });
      } catch (error) {
        console.error(
          `Fehler bei der automatischen Zusammenführung von Vorschlag ${candidate.proposal._id}:`,
          error
        );

        mergeResults.push({
          success: false,
          sourceProposalId: candidate.proposal._id,
          error: error.message,
        });
      }
    }

    const successfulMerges = mergeResults.filter((r) => r.success);

    return res.status(200).json({
      message: "Automatische Zusammenführung und Bereinigung abgeschlossen",
      mergeCount: successfulMerges.length,
      deletedCount: deletedProposalIds.length,
      mergeResults,
      deletedProposalIds,
    });
  } catch (error) {
    console.error("Fehler bei der automatischen Zusammenführung:", error);
    return res.status(500).json({
      message: "Fehler bei der automatischen Zusammenführung",
      error: error.message,
    });
  }
};

/**
 * Analysiert und führt automatisch einen neuen Vorschlag zusammen, wenn ähnliche Vorschläge gefunden werden
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const autoAnalyzeProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Vorschlag aus der Datenbank holen
    const proposal = await Proposal.findById(proposalId)
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name");

    if (!proposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    // Bestehende Vorschläge zum Vergleich aus der Datenbank holen (exklusive des aktuellen Vorschlags)
    const existingProposals = await Proposal.find({
      _id: { $ne: proposalId },
      status: { $nin: ["deleted", "rejected", "merged"] },
      mergeSource: { $ne: true }, // Nur Vorschläge, die nicht bereits zusammengeführt wurden
    })
      .populate("categories.category", "name")
      .populate("ministries.ministry", "name")
      .sort({ createdAt: -1 }) // Neueste zuerst
      .limit(15); // Beschränkung für Performanz

    console.log("Vorschlag wird analysiert:", proposal.title);
    console.log(
      "Anzahl bestehender Vorschläge zum Vergleich:",
      existingProposals.length
    );

    // Gemini API zur Analyse der Ähnlichkeit nutzen
    const similarityAnalysis = await geminiService.analyzeProposalSimilarity(
      proposal,
      existingProposals
    );

    console.log("Ähnlichkeitsanalyse abgeschlossen:");
    console.log("- Ist ähnlich:", similarityAnalysis.isSimilar);
    console.log("- Empfehlung:", similarityAnalysis.recommendation);
    console.log(
      "- Anzahl ähnlicher Vorschläge:",
      similarityAnalysis.similarProposals?.length || 0
    );

    // Niedrigerer Schwellenwert für die Erkennung ähnlicher Vorschläge (von 0.7 auf 0.6)
    const SIMILARITY_THRESHOLD = 0.6;

    // Prüfen, ob der Vorschlag mit anderen zusammengeführt werden sollte
    if (
      similarityAnalysis.recommendation === "merge" &&
      similarityAnalysis.similarProposals &&
      similarityAnalysis.similarProposals.length > 0
    ) {
      // Ähnliche Vorschläge mit hoher Ähnlichkeit sammeln (niedrigerer Schwellenwert für bessere Erkennung)
      const similarProposalIds = similarityAnalysis.similarProposals
        .filter((p) => p.similarityScore >= SIMILARITY_THRESHOLD)
        .map((p) => p.id);

      console.log(
        `Gefundene ähnliche Vorschläge (Score >= ${SIMILARITY_THRESHOLD}):`,
        similarProposalIds.length
      );

      if (similarProposalIds.length > 0) {
        // Ähnliche Vorschläge holen
        const targetProposals = await Proposal.find({
          _id: { $in: similarProposalIds },
        });

        console.log(
          "Beginne Zusammenführung von",
          targetProposals.length + 1,
          "Vorschlägen"
        );

        // Gemini API zum Zusammenführen der Vorschläge nutzen
        const mergeResult = await geminiService.mergeProposals(
          proposal,
          targetProposals
        );

        // Neuen zusammengeführten Vorschlag erstellen
        const mergedProposal = new Proposal({
          title: mergeResult.title,
          content: mergeResult.content,
          status: "submitted",
          user: proposal.user, // Der ursprüngliche Autor wird beibehalten
          categories: proposal.categories, // Kategorien vom Ursprungsvorschlag übernehmen
          ministries: proposal.ministries, // Ministerien vom Ursprungsvorschlag übernehmen
          isMerged: false, // Dieser Vorschlag ist das Endergebnis einer Zusammenführung
          mergeSource: false,
          mergeParents: [proposalId, ...similarProposalIds], // Speichert die Quell-IDs
        });

        const savedMergedProposal = await mergedProposal.save();

        // Analyse für den neuen zusammengeführten Vorschlag erstellen
        const mergedAnalysis = new ProposalAnalysis({
          proposal: savedMergedProposal._id,
          isMerged: false,
          mergeSource: false,
          mergeRationale: mergeResult.mergeRationale,
          isProcessed: true,
          lastProcessedAt: new Date(),
        });

        await mergedAnalysis.save();

        // IDs der zusammengeführten Vorschläge
        const sourceIds = [proposalId, ...similarProposalIds];

        // Aktualisiere Kommentare auf den neuen zusammengeführten Vorschlag
        await Comment.updateMany(
          { proposal: { $in: sourceIds } },
          { proposal: savedMergedProposal._id }
        );

        // Lösche die alten Vorschläge und deren Analysen
        await Promise.all([
          Proposal.deleteMany({ _id: { $in: sourceIds } }),
          ProposalAnalysis.deleteMany({ proposal: { $in: sourceIds } }),
        ]);

        console.log(
          "Zusammenführung abgeschlossen. Neuer Vorschlag erstellt:",
          savedMergedProposal._id
        );

        return res.status(201).json({
          message:
            "Vorschlag wurde automatisch mit ähnlichen Vorschlägen zusammengeführt",
          originalProposal: proposal,
          mergedProposal: savedMergedProposal,
          sourceProposalId: proposalId,
          targetProposalIds: similarProposalIds,
          mergeRationale: mergeResult.mergeRationale,
          similarityAnalysis: similarityAnalysis,
        });
      }
    }

    // Wenn keine Zusammenführung stattfand, führe normale Analyse durch
    // Bewertung des Vorschlags mit Gemini API
    const evaluation = await geminiService.evaluateProposal(proposal);

    // Kategorienvorschläge von Gemini API holen
    const categories = await Category.find({ isActive: true });
    const categorySuggestions = await geminiService.suggestCategories(
      proposal,
      categories
    );

    // Ähnliche Vorschläge IDs und Empfehlungen speichern
    const similarProposalRefs = [];
    if (
      similarityAnalysis.similarProposals &&
      similarityAnalysis.similarProposals.length > 0
    ) {
      // Referenzen auf ähnliche Vorschläge speichern
      for (const similar of similarityAnalysis.similarProposals) {
        similarProposalRefs.push({
          proposal: similar.id,
          similarityScore: similar.similarityScore,
          reason: similar.reason,
        });
      }
    }

    // Kategorienvorschläge formatieren
    const suggestedCategoryRefs = [];
    if (
      categorySuggestions.suggestedCategories &&
      categorySuggestions.suggestedCategories.length > 0
    ) {
      for (const suggestion of categorySuggestions.suggestedCategories) {
        // Kategorie-ID anhand des Namens finden
        const category = categories.find(
          (c) => c.name === suggestion.categoryName
        );
        if (category) {
          suggestedCategoryRefs.push({
            category: category._id,
            confidence: suggestion.confidence,
            reason: suggestion.reason,
          });
        }
      }
    }

    // Analyse in der Datenbank speichern
    const analysis = await ProposalAnalysis.create({
      proposal: proposalId,
      similarProposals: similarProposalRefs,
      mergeStrategy: similarityAnalysis.mergeStrategy,
      aiEvaluation: {
        quality: evaluation.quality,
        relevance: evaluation.relevance,
        feasibility: evaluation.feasibility,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        summary: evaluation.summary,
      },
      suggestedCategories: suggestedCategoryRefs,
      isProcessed: true,
      lastProcessedAt: new Date(),
    });

    // AI-Analyse auch im Vorschlag selbst speichern
    await Proposal.findByIdAndUpdate(proposalId, {
      aiAnalysis: {
        quality: evaluation.quality,
        relevance: evaluation.relevance,
        feasibility: evaluation.feasibility,
        keywords: evaluation.keywords || [],
      },
    });

    // Lade die Analyse mit allen Beziehungen
    const populatedAnalysis = await ProposalAnalysis.findById(
      analysis._id
    ).populate({
      path: "similarProposals.proposal",
      select: "title content",
    });

    return res.status(200).json({
      message:
        "Vorschlag erfolgreich analysiert (keine automatische Zusammenführung)",
      analysis: populatedAnalysis,
      similarityAnalysis: similarityAnalysis,
      recommendation: similarityAnalysis.recommendation,
    });
  } catch (error) {
    console.error(
      "Fehler bei der automatischen Analyse und Zusammenführung:",
      error
    );
    return res.status(500).json({
      message: "Fehler bei der automatischen Analyse und Zusammenführung",
      error: error.message,
    });
  }
};

/**
 * Analysiert eine Zusammenfassung eines Vorschlags und speichert die KI-Bewertung in der Datenbank
 * @param {Object} req - Express Request Objekt
 * @param {Object} res - Express Response Objekt
 */
const analyzeProposalSummary = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { summary } = req.body;

    if (!summary || typeof summary !== "string") {
      return res.status(400).json({
        message: "Eine Zusammenfassung muss als Text übermittelt werden",
      });
    }

    // Vorschlag aus der Datenbank holen
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: "Vorschlag nicht gefunden" });
    }

    // Zusammenfassung mit Gemini API analysieren
    const analysisResult = await geminiService.analyzeSummaryAndSave(
      summary,
      proposal
    );

    // Bestehende Analyse in der Datenbank suchen
    let analysis = await ProposalAnalysis.findOne({ proposal: proposalId });

    if (analysis) {
      // Bestehende Analyse aktualisieren
      analysis = await ProposalAnalysis.findOneAndUpdate(
        { proposal: proposalId },
        {
          aiEvaluation: {
            ...analysis.aiEvaluation,
            quality: analysisResult.quality,
            relevance: analysisResult.relevance,
            feasibility: analysisResult.feasibility,
            sustainability: analysisResult.sustainability,
            innovation: analysisResult.innovation,
            summary: summary, // Die ursprüngliche Zusammenfassung speichern
          },
          lastProcessedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Neue Analyse erstellen
      analysis = await ProposalAnalysis.create({
        proposal: proposalId,
        aiEvaluation: {
          quality: analysisResult.quality,
          relevance: analysisResult.relevance,
          feasibility: analysisResult.feasibility,
          sustainability: analysisResult.sustainability,
          innovation: analysisResult.innovation,
          summary: summary,
        },
        isProcessed: true,
        lastProcessedAt: new Date(),
      });
    }

    // AI-Analyse auch im Vorschlag selbst aktualisieren
    await Proposal.findByIdAndUpdate(proposalId, {
      aiAnalysis: {
        ...proposal.aiAnalysis,
        quality: analysisResult.quality,
        relevance: analysisResult.relevance,
        feasibility: analysisResult.feasibility,
        sustainability: analysisResult.sustainability,
        innovation: analysisResult.innovation,
        analysisDate: new Date(),
      },
    });

    return res.status(200).json({
      message: "Zusammenfassung erfolgreich analysiert und bewertet",
      analysis,
      aiEvaluation: analysisResult,
    });
  } catch (error) {
    console.error("Fehler bei der Analyse der Zusammenfassung:", error);
    return res.status(500).json({
      message: "Fehler bei der Analyse der Zusammenfassung",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeNewProposal,
  mergeProposals,
  reevaluateProposal,
  processUnanalyzedProposals,
  pruneOrphanedAnalyses,
  autoMergeProposals,
  autoAnalyzeProposal,
  analyzeProposalSummary,
  getProposalAnalysis,
  getTopProposals,
};
