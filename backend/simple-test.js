const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Ohne Angabe des Pfades - sollte die lokale .env im Backend-Verzeichnis laden
dotenv.config();

console.log("GEMINI_API_KEY nach dotenv.config():", process.env.GEMINI_API_KEY);

// Zum Vergleich: Direkt aus der Datei lesen
const envContent = fs.readFileSync(".env", "utf8");
const apiKeyLine = envContent
  .split("\n")
  .find((line) => line.startsWith("GEMINI_API_KEY="));
console.log("API-Key-Zeile in lokaler .env:", apiKeyLine);
