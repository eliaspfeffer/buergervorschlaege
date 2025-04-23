const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Klares Nachladen
console.log("Vor dem Laden: GEMINI_API_KEY =", process.env.GEMINI_API_KEY);

// Lade direkt aus der lokalen .env-Datei
const envContent = fs.readFileSync(".env", "utf8");
const apiKeyLine = envContent
  .split("\n")
  .find((line) => line.startsWith("GEMINI_API_KEY="));
const newApiKey = apiKeyLine.split("=")[1];

// Setze die Umgebungsvariable manuell
process.env.GEMINI_API_KEY = newApiKey;
console.log(
  "Nach manuellem Setzen: GEMINI_API_KEY =",
  process.env.GEMINI_API_KEY
);

// Test mit der Gemini API
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log("\nTeste mit Modell gemini-1.5-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Verwende neueren Modellnamen

    const testPrompt =
      "Gib mir eine kurze Zusammenfassung über künstliche Intelligenz in einem Satz.";
    const result = await model.generateContent(testPrompt);
    console.log("Ergebnis:", result.response.text());
    return true;
  } catch (error) {
    console.error("Fehler beim API-Test:", error);
    return false;
  }
}

testGemini().then((success) => {
  if (success) {
    console.log("\n✅ API-Test erfolgreich! Der neue Schlüssel funktioniert.");
  } else {
    console.log(
      "\n❌ API-Test fehlgeschlagen. Weitere Fehlersuche erforderlich."
    );
  }
});
