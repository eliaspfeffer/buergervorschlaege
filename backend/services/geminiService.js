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
# Aufgabe: Umfassende Bewertung eines Bürgervorschlags

## Kontext
Du bist ein Politikberater und Experte für öffentliche Verwaltung, der einen Bürgervorschlag für Politiker und Entscheidungsträger bewerten soll. Deine Bewertung wird sowohl Bürgern als auch Politikern angezeigt und soll helfen, den Wert des Vorschlags einzuschätzen.

## Zu bewertender Vorschlag
**Titel:** ${proposal.title}
**Inhalt:** ${proposal.content}
**Kategorie:** ${
      proposal.categories
        ?.map((c) => c.category?.name)
        .filter(Boolean)
        .join(", ") || "Keine Kategorie"
    }

## Bewertungskriterien
Bewerte den Vorschlag auf einer Skala von 0 bis 1 (wobei 1 das Höchste ist) nach folgenden Kriterien:

1. **Qualität (0-1)**: 
   - Wie klar, durchdacht und gut formuliert ist der Vorschlag?
   - Ist er faktenbasiert und logisch aufgebaut?
   - Berücksichtigt er verschiedene Perspektiven?

2. **Relevanz (0-1)**: 
   - Wie wichtig ist das angesprochene Problem für die Gesellschaft?
   - Betrifft es viele Bürger oder nur eine kleine Gruppe?
   - Adressiert es aktuelle oder zukünftige Herausforderungen?

3. **Umsetzbarkeit (0-1)**: 
   - Wie realistisch ist die Umsetzung des Vorschlags?
   - Berücksichtigt er rechtliche, finanzielle und praktische Aspekte?
   - Ist der Aufwand im Verhältnis zum erwarteten Nutzen angemessen?

4. **Nachhaltigkeit (0-1)**: 
   - Wie langfristig wirksam ist der Vorschlag?
   - Berücksichtigt er ökologische, soziale und ökonomische Nachhaltigkeit?
   - Schafft er dauerhafte Lösungen statt nur kurzfristiger Verbesserungen?

5. **Innovationsgrad (0-1)**: 
   - Wie neuartig und kreativ ist der Ansatz?
   - Bietet er neue Lösungswege für bekannte Probleme?
   - Nutzt er moderne Technologien oder Methoden?

## Zusätzliche Analyse
- **Stärken**: Liste 2-4 zentrale Stärken des Vorschlags auf
- **Schwächen**: Liste 2-4 wesentliche Schwächen oder Verbesserungspotenziale auf
- **Politische Einordnung**: Welche politischen Ressorts oder Ministerien wären für die Umsetzung zuständig?
- **Gesellschaftlicher Nutzen**: Welchen konkreten Mehrwert schafft dieser Vorschlag für die Gesellschaft?
- **Kostenabschätzung**: Grobe Einschätzung der Kosten (niedrig/mittel/hoch) und des Nutzens im Verhältnis dazu

## Erwartetes Ausgabeformat (JSON)
Bitte gib deine Bewertung ausschließlich im folgenden JSON-Format zurück:

\`\`\`json
{
  "quality": 0.85,
  "relevance": 0.9,
  "feasibility": 0.7,
  "sustainability": 0.8,
  "innovation": 0.65,
  "keywords": ["Keyword1", "Keyword2", "Keyword3"],
  "strengths": ["Stärke 1", "Stärke 2", "Stärke 3"],
  "weaknesses": ["Schwäche 1", "Schwäche 2"],
  "politicalDomains": ["Ressort 1", "Ressort 2"],
  "societalBenefit": "Kurze prägnante Beschreibung des gesellschaftlichen Nutzens",
  "costBenefitRatio": "niedrig/mittel/hoch",
  "summary": "Eine ausgewogene, objektive Zusammenfassung der Bewertung in 2-3 Sätzen."
}
\`\`\`

Wichtige Hinweise:
- Bewahre eine sachliche, neutrale Perspektive
- Sei respektvoll gegenüber dem Vorschlag, aber auch ehrlich in der Bewertung
- Berücksichtige verschiedene politische Perspektiven
- Liefere eine faktenbasierte, konstruktive Bewertung
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
      sustainability: 0.5,
      innovation: 0.5,
      keywords: [],
      strengths: [],
      weaknesses: [],
      politicalDomains: [],
      societalBenefit: "Keine Bewertung möglich",
      costBenefitRatio: "mittel",
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

/**
 * Analysiert eine Zusammenfassung und liefert KI-Bewertungen für die Qualitätskriterien
 * @param {string} summary - Die Zusammenfassung, die analysiert werden soll
 * @param {Object} proposal - Der Originalvorschlag für den Kontext
 * @returns {Object} Die Bewertung der Qualitätskriterien
 */
async function analyzeSummaryAndSave(summary, proposal) {
  try {
    const prompt = `
# Aufgabe: Bewertung einer Vorschlagszusammenfassung

## Kontext
Du erhältst die Zusammenfassung eines Bürgervorschlags. Deine Aufgabe ist es, diese Zusammenfassung zu bewerten und Qualitätskriterien zu ermitteln.

## Zu bewertende Zusammenfassung
**Zusammenfassung:** ${summary}

**Ursprünglicher Vorschlagstitel:** ${proposal.title || "Kein Titel verfügbar"}

## Bewertungskriterien
Bewerte die Zusammenfassung auf einer Skala von 0 bis 1 (wobei 1 das Höchste ist) nach folgenden Kriterien:

1. **Qualität (0-1)**: 
   - Wie klar, durchdacht und gut formuliert ist die Zusammenfassung?
   - Gibt sie den ursprünglichen Vorschlag treffend wieder?

2. **Relevanz (0-1)**: 
   - Wie relevant erscheint das zusammengefasste Anliegen für die Gesellschaft?
   - Wird die Wichtigkeit des Themas deutlich?

3. **Umsetzbarkeit (0-1)**: 
   - Erscheint der zusammengefasste Vorschlag realistisch umsetzbar?
   - Werden praktische Aspekte berücksichtigt?

4. **Nachhaltigkeit (0-1)**: 
   - Adressiert die Zusammenfassung langfristige Lösungen?
   - Werden ökologische, soziale oder ökonomische Nachhaltigkeitsaspekte berücksichtigt?

5. **Innovationsgrad (0-1)**: 
   - Beschreibt die Zusammenfassung einen innovativen oder kreativen Ansatz?
   - Werden neue Lösungswege aufgezeigt?

## Erwartetes Ausgabeformat (JSON)
Bitte gib deine Bewertung ausschließlich im folgenden JSON-Format zurück:

\`\`\`json
{
  "quality": 0.85,
  "relevance": 0.9,
  "feasibility": 0.7,
  "sustainability": 0.8,
  "innovation": 0.65,
  "summary": "Eine kurze Meta-Einschätzung der Zusammenfassung in 1-2 Sätzen."
}
\`\`\`
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
    console.error("Fehler bei der Analyse der Zusammenfassung:", error);
    return {
      quality: 0.5,
      relevance: 0.5,
      feasibility: 0.5,
      sustainability: 0.5,
      innovation: 0.5,
      summary: "Fehler bei der Analyse. Neutrale Standardbewertung vergeben.",
    };
  }
}

module.exports = {
  analyzeProposalSimilarity,
  mergeProposals,
  evaluateProposal,
  suggestCategories,
  analyzeSummaryAndSave,
};
