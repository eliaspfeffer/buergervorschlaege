const geminiService = require("./services/geminiService");

async function testApi() {
  try {
    const testProposal = {
      title: "Test Vorschlag",
      content: "Dies ist ein Testinhalt für die Gemini API",
      categories: [],
    };

    console.log("Teste evaluateProposal Funktion...");
    const result = await geminiService.evaluateProposal(testProposal);
    console.log("API-Test erfolgreich!");
    console.log(JSON.stringify(result, null, 2));

    // Optional: Test der Zusammenführung
    console.log("\nTeste mergeProposals Funktion...");
    const similarProposal = {
      title: "Ähnlicher Vorschlag",
      content:
        "Dies ist ein ähnlicher Vorschlagsinhalt zum Testen der Zusammenführungsfunktion",
      categories: [],
    };

    const mergeResult = await geminiService.mergeProposals(testProposal, [
      similarProposal,
    ]);
    console.log("Zusammenführung erfolgreich!");
    console.log(JSON.stringify(mergeResult, null, 2));
  } catch (error) {
    console.error("API-Test fehlgeschlagen:");
    console.error(error);
  }
}

testApi().then(() => console.log("Test abgeschlossen"));
