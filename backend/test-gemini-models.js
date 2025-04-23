const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Stelle sicher, dass die Umgebungsvariablen geladen sind
dotenv.config({ path: path.join(__dirname, "../.env") });

// API-Key aus Umgebungsvariablen laden
const apiKey = process.env.GEMINI_API_KEY;

// Gemini API initialisieren
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log("API-Schlüssel:", apiKey);
    console.log("Versuche, verfügbare Modelle zu listen...");

    // Abfragen der verfügbaren Modelle
    const models = await genAI.listModels();
    console.log("Verfügbare Modelle:", models);
  } catch (error) {
    console.error("Fehler beim Abrufen der Modelle:", error);
  }
}

// Test mit einem anderen Modellnamen
async function testWithGeminiProVision() {
  try {
    console.log("\nTeste mit gemini-1.0-pro statt gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const testPrompt =
      "Gib mir eine kurze Zusammenfassung über künstliche Intelligenz in einem Satz.";
    const result = await model.generateContent(testPrompt);
    console.log("Ergebnis:", result.response.text());
  } catch (error) {
    console.error("Fehler beim Testen mit gemini-1.0-pro:", error);
  }
}

listModels()
  .then(() => testWithGeminiProVision())
  .then(() => console.log("Tests abgeschlossen"));
