const dotenv = require("dotenv");
const path = require("path");

// Pfad zur .env-Datei ausgeben
const envPath = path.join(__dirname, "../.env");
console.log("Pfad zur .env-Datei:", envPath);

// Umgebungsvariablen laden
dotenv.config({ path: envPath });

// API-Key ausgeben
console.log("GEMINI_API_KEY aus process.env:", process.env.GEMINI_API_KEY);

// Direktes Lesen der .env-Datei mit fs
const fs = require("fs");
try {
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log("\nInhalt der .env-Datei:");

  // Suche nach der API-Key-Zeile und gib sie aus
  const apiKeyLine = envContent
    .split("\n")
    .find((line) => line.startsWith("GEMINI_API_KEY="));
  console.log("API-Key-Zeile in .env:", apiKeyLine);
} catch (error) {
  console.error("Fehler beim Lesen der .env-Datei:", error);
}
