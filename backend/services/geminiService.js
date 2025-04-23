const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Stelle sicher, dass die Umgebungsvariablen geladen sind
dotenv.config({ path: path.join(__dirname, "../../.env") });

// API-Key aus Umgebungsvariablen laden
const apiKey = process.env.GEMINI_API_KEY;

// Prüfen, ob der API-Key vorhanden ist
if (!apiKey) {
  console.error(
    "WARNUNG: GEMINI_API_KEY ist nicht in der .env-Datei definiert"
  );
}

// Gemini API initialisieren
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Analysiert einen Vorschlag auf Ähnlichkeiten mit vorhandenen Vorschlägen
 * @param {Object} newProposal - Der neue Vorschlag
 * @param {Array} existingProposals - Eine Liste existierender Vorschläge
 * @returns {Object} Analyseergebnis mit Ähnlichkeiten und Empfehlungen
 */
async function analyzeProposalSimilarity(newProposal, existingProposals) {
  try {
    const prompt = `
Analysiere den folgenden neuen Bürgervorschlag und vergleiche ihn mit existierenden Vorschlägen.
Identifiziere Ähnlichkeiten und entscheide, ob der neue Vorschlag:
1. Einzigartig ist und als eigener Eintrag gespeichert werden sollte
2. Sehr ähnlich zu einem oder mehreren existierenden Vorschlägen ist und zusammengeführt werden sollte
3. Redundant ist und verworfen werden sollte

Neuer Vorschlag:
Titel: ${newProposal.title}
Inhalt: ${newProposal.content}
Kategorie: ${
      newProposal.categories
        ?.map((c) => c.category?.name)
        .filter(Boolean)
        .join(", ") || "Keine Kategorie"
    }

Existierende Vorschläge:
${existingProposals
  .map(
    (p, i) => `
${i + 1}. Titel: ${p.title}
   Inhalt: ${p.content}
   ID: ${p._id}
   Kategorie: ${
     p.categories
       ?.map((c) => c.category?.name)
       .filter(Boolean)
       .join(", ") || "Keine Kategorie"
   }
`
  )
  .join("\n")}

Gib deine Antwort im folgenden JSON-Format zurück:
{
  "isSimilar": true/false,
  "similarProposals": [{"id": "proposal_id", "similarityScore": 0.85, "reason": "Grund für Ähnlichkeit"}],
  "recommendation": "unique"/"merge"/"discard",
  "mergeStrategy": "Der neue Vorschlag sollte mit Vorschlag X zusammengeführt werden, indem...",
  "summary": "Zusammenfassung der Analyse"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extrahiere das JSON aus der Antwort
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error(
      "Konnte kein gültiges JSON aus der Gemini-Antwort extrahieren"
    );
  } catch (error) {
    console.error("Fehler bei der Analyse der Vorschlagsähnlichkeit:", error);
    return {
      isSimilar: false,
      similarProposals: [],
      recommendation: "unique",
      mergeStrategy: "",
      summary:
        "Fehler bei der Analyse. Der Vorschlag wird als einzigartig behandelt.",
    };
  }
}

/**
 * Führt ähnliche Vorschläge zusammen
 * @param {Object} newProposal - Der neue Vorschlag
 * @param {Array} similarProposals - Ähnliche Vorschläge
 * @returns {Object} Zusammengeführter Vorschlag
 */
async function mergeProposals(newProposal, similarProposals) {
  try {
    const proposalsData = [
      { title: newProposal.title, content: newProposal.content },
      ...similarProposals.map((p) => ({ title: p.title, content: p.content })),
    ];

    const prompt = `
Führe die folgenden Bürgervorschläge zu einem einzigen, umfassenden Vorschlag zusammen.
Der zusammengeführte Vorschlag sollte:
1. Die wesentlichen Punkte aller Vorschläge enthalten
2. Redundanzen vermeiden
3. Klar strukturiert und verständlich sein
4. Einen prägnanten Titel haben

Vorschläge zur Zusammenführung:
${proposalsData
  .map(
    (p, i) => `
${i + 1}. Titel: ${p.title}
   Inhalt: ${p.content}
`
  )
  .join("\n")}

Gib deine Antwort im folgenden JSON-Format zurück:
{
  "title": "Neuer zusammengeführter Titel",
  "content": "Ausführlicher zusammengeführter Inhalt",
  "mergeRationale": "Erklärung, wie und warum die Vorschläge zusammengeführt wurden"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extrahiere das JSON aus der Antwort
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error(
      "Konnte kein gültiges JSON aus der Gemini-Antwort extrahieren"
    );
  } catch (error) {
    console.error("Fehler beim Zusammenführen der Vorschläge:", error);
    return {
      title: newProposal.title,
      content: newProposal.content,
      mergeRationale:
        "Fehler beim Zusammenführen. Original-Vorschlag beibehalten.",
    };
  }
}

/**
 * Bewertet einen Vorschlag nach Qualität, Relevanz und Umsetzbarkeit
 * @param {Object} proposal - Der zu bewertende Vorschlag
 * @returns {Object} Bewertungsergebnis
 */
async function evaluateProposal(proposal) {
  try {
    const prompt = `
Bitte bewerte den folgenden Bürgervorschlag nach den Kriterien Qualität, Relevanz und Umsetzbarkeit.

Vorschlag:
Titel: ${proposal.title}
Inhalt: ${proposal.content}
Kategorie: ${
      proposal.categories
        ?.map((c) => c.category?.name)
        .filter(Boolean)
        .join(", ") || "Keine Kategorie"
    }

Qualität: Bewerte die Klarheit, Vollständigkeit und Genauigkeit des Vorschlags.
Relevanz: Bewerte, wie relevant der Vorschlag für öffentliche Belange und aktuelle Probleme ist.
Umsetzbarkeit: Bewerte, wie realistisch die Umsetzung des Vorschlags ist.

Gib deine Antwort im folgenden JSON-Format zurück:
{
  "quality": 0.85, // Wert zwischen 0 und 1
  "relevance": 0.9, // Wert zwischen 0 und 1
  "feasibility": 0.7, // Wert zwischen 0 und 1
  "keywords": ["Schlüsselwort1", "Schlüsselwort2"],
  "strengths": ["Stärke 1", "Stärke 2"],
  "weaknesses": ["Schwäche 1", "Schwäche 2"],
  "summary": "Zusammenfassende Bewertung"
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extrahiere das JSON aus der Antwort
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error(
      "Konnte kein gültiges JSON aus der Gemini-Antwort extrahieren"
    );
  } catch (error) {
    console.error("Fehler bei der Bewertung des Vorschlags:", error);
    return {
      quality: 0.5,
      relevance: 0.5,
      feasibility: 0.5,
      keywords: [],
      strengths: [],
      weaknesses: [],
      summary: "Fehler bei der Bewertung. Neutrale Standardbewertung vergeben.",
    };
  }
}

/**
 * Generiert Kategorienvorschläge für einen Vorschlag
 * @param {Object} proposal - Der Vorschlag
 * @param {Array} availableCategories - Verfügbare Kategorien
 * @returns {Array} Vorgeschlagene Kategorien mit Konfidenzwerten
 */
async function suggestCategories(proposal, availableCategories) {
  try {
    const prompt = `
Analysiere den folgenden Bürgervorschlag und empfehle passende Kategorien aus der Liste verfügbarer Kategorien.

Vorschlag:
Titel: ${proposal.title}
Inhalt: ${proposal.content}

Verfügbare Kategorien:
${availableCategories
  .map((c) => c.name + (c.description ? ": " + c.description : ""))
  .join("\n")}

Gib deine Antwort im folgenden JSON-Format zurück:
{
  "suggestedCategories": [
    {"categoryName": "Kategoriename", "confidence": 0.9, "reason": "Begründung für die Kategorie"},
    ...
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extrahiere das JSON aus der Antwort
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error(
      "Konnte kein gültiges JSON aus der Gemini-Antwort extrahieren"
    );
  } catch (error) {
    console.error("Fehler bei den Kategorievorschlägen:", error);
    return {
      suggestedCategories: [],
    };
  }
}

module.exports = {
  analyzeProposalSimilarity,
  mergeProposals,
  evaluateProposal,
  suggestCategories,
};
