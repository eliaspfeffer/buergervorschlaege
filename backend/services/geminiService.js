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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Analysiert einen Vorschlag auf Ähnlichkeiten mit vorhandenen Vorschlägen
 * @param {Object} newProposal - Der neue Vorschlag
 * @param {Array} existingProposals - Eine Liste existierender Vorschläge
 * @returns {Object} Analyseergebnis mit Ähnlichkeiten und Empfehlungen
 */
async function analyzeProposalSimilarity(newProposal, existingProposals) {
  try {
    const prompt = `
# Aufgabe: Analyse der Ähnlichkeit zwischen Bürgervorschlägen

## Kontext
Du bist ein KI-Assistent für eine Bürgervorschlagsplattform. Deine Aufgabe ist es, zu analysieren, ob ein neuer Vorschlag ähnlich zu bereits existierenden Vorschlägen ist und ob eine Zusammenführung sinnvoll wäre.

## Richtlinien zur Ähnlichkeitsanalyse
1. **Inhaltliche Ähnlichkeit**: Fokussiere hauptsächlich auf die inhaltliche Ähnlichkeit der Vorschläge, nicht nur auf Ähnlichkeiten im Titel.
2. **Themenbereiche**: Prüfe, ob die Vorschläge den gleichen Themenbereich behandeln.
3. **Lösungsansätze**: Achte darauf, ob ähnliche Lösungsansätze oder Ideen vorgeschlagen werden.
4. **Ziele**: Berücksichtige, ob die Vorschläge ähnliche Ziele verfolgen, selbst wenn die konkreten Maßnahmen unterschiedlich sind.
5. **Semantische Ähnlichkeit**: Achte auf semantische Ähnlichkeiten, auch wenn unterschiedliche Formulierungen verwendet werden.

## Schwellenwerte für Ähnlichkeit
- **Hohe Ähnlichkeit (Score ≥ 0.7)**: Die Vorschläge behandeln das gleiche Thema mit ähnlichen Lösungsansätzen.
- **Mittlere Ähnlichkeit (Score 0.5-0.7)**: Die Vorschläge behandeln ähnliche Themen oder könnten sich ergänzen.
- **Geringe Ähnlichkeit (Score < 0.5)**: Die Vorschläge haben nur oberflächliche Ähnlichkeiten.

## Zu analysierender neuer Vorschlag
**Titel:** ${newProposal.title}
**Inhalt:** ${newProposal.content}
**Kategorie:** ${
      newProposal.categories
        ?.map((c) => c.category?.name)
        .filter(Boolean)
        .join(", ") || "Keine Kategorie"
    }

## Existierende Vorschläge zum Vergleich
${existingProposals
  .map(
    (p, i) => `
### Vorschlag ${i + 1}
**ID:** ${p._id}
**Titel:** ${p.title}
**Inhalt:** ${p.content}
**Kategorie:** ${
      p.categories
        ?.map((c) => c.category?.name)
        .filter(Boolean)
        .join(", ") || "Keine Kategorie"
    }
`
  )
  .join("\n")}

## Gewünschtes Ausgabeformat (JSON)
Bitte gib deine Antwort ausschließlich im folgenden JSON-Format zurück:

\`\`\`json
{
  "isSimilar": true/false,
  "similarProposals": [
    {"id": "proposal_id", "similarityScore": 0.85, "reason": "Detaillierte Begründung für die Ähnlichkeit"}
  ],
  "recommendation": "unique"/"merge"/"discard",
  "mergeStrategy": "Beschreibung, wie die Vorschläge zusammengeführt werden sollten",
  "summary": "Zusammenfassung der Analyse"
}
\`\`\`

## Wichtige Hinweise
- Sei großzügig bei der Erkennung von Ähnlichkeiten - im Zweifelsfall ist eine Zusammenführung besser als doppelte Vorschläge
- Die similarityScore sollte zwischen 0 und 1 liegen, wobei 1 für identische Vorschläge steht
- Gib eine klare Empfehlung ab: "unique" (einzigartig), "merge" (zusammenführen) oder "discard" (verwerfen)
- Wenn mehrere Vorschläge ähnlich sind, liste alle mit ihren jeweiligen Ähnlichkeitswerten auf
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
      {
        title: newProposal.title,
        content: newProposal.content,
        id: newProposal._id,
      },
      ...similarProposals.map((p) => ({
        title: p.title,
        content: p.content,
        id: p._id,
      })),
    ];

    const prompt = `
# Aufgabe: Intelligente Zusammenführung von Bürgervorschlägen

## Kontext
Es wurden mehrere ähnliche Bürgervorschläge identifiziert, die dasselbe oder ein sehr ähnliches Thema behandeln. Deine Aufgabe ist es, diese Vorschläge zu einem einzigen, umfassenden und gut strukturierten Vorschlag zusammenzuführen.

## Richtlinien für die Zusammenführung
1. **Vollständigkeit**: Stelle sicher, dass keine wichtigen Informationen, Argumente oder Perspektiven aus den Originalvorschlägen verloren gehen.
2. **Eliminierung von Redundanzen**: Entferne Wiederholungen und fasse ähnliche Punkte zusammen.
3. **Strukturierte Darstellung**: Der zusammengeführte Vorschlag sollte klar strukturiert sein mit:
   - Einer prägnanten Einleitung, die das Problem/Anliegen beschreibt
   - Einem Hauptteil mit den konkreten Vorschlägen und Begründungen
   - Einer klaren Zusammenfassung oder Schlussfolgerung
4. **Ausgewogenheit**: Berücksichtige alle wichtigen Perspektiven aus den Originalvorschlägen.
5. **Präzision und Klarheit**: Der Text sollte präzise, verständlich und für die Öffentlichkeit zugänglich sein.
6. **Kreativität**: Verbessere die Vorschläge, indem du die besten Elemente aller Vorschläge kombinierst und mögliche Lücken schließt.

## Zu kombinierende Vorschläge
${proposalsData
  .map(
    (p, i) => `
### Vorschlag ${i + 1} (ID: ${p.id})
**Titel:** ${p.title}
**Inhalt:**
${p.content}
`
  )
  .join("\n")}

## Gewünschtes Ausgabeformat (JSON)
Bitte gib deine Antwort im folgenden JSON-Format zurück:

\`\`\`json
{
  "title": "Ein prägnanter, klarer Titel, der den Kern des zusammengeführten Vorschlags erfasst",
  "content": "Der vollständige, gut strukturierte Inhalt des zusammengeführten Vorschlags",
  "mergeRationale": "Eine Erklärung deiner Zusammenführungsstrategie: Welche wichtigen Elemente du aus jedem Vorschlag übernommen hast, wie du sie integriert hast und warum."
}
\`\`\`

## Hinweise zur Qualität
- Der Titel sollte prägnant und aussagekräftig sein, idealerweise nicht länger als 10-12 Wörter
- Der Inhalt sollte mindestens so detailliert sein wie der umfangreichste Originalvorschlag
- Vermeide Füllwörter und konzentriere dich auf konkrete Vorschläge und Begründungen
- Achte auf einen sachlichen, konstruktiven Ton
`;

    // Model-Wahl optimieren
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
