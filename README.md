# Bürgerbeteiligungssystem mit KI

Ein System zur Bürgerbeteiligung, das mithilfe von KI Bürgervorschläge kategorisiert, priorisiert und an die zuständigen Ministerien weiterleitet.

## Übersicht

Dieses System ermöglicht es Bürgern, Vorschläge einzureichen, die dann durch KI-Unterstützung analysiert, kategorisiert und den zuständigen Ministerien oder Behörden zugeteilt werden. Ministeriumsmitarbeiter können die Vorschläge bearbeiten und beantworten, während die Bürger den Fortschritt ihrer Vorschläge verfolgen können.

## Hauptfunktionen

- Einreichen von Bürgervorschlägen
- KI-gestützte Kategorisierung und Analyse
- Zuweisung an zuständige Ministerien
- Kommentare und Bewertungen
- Statistiken und Dashboards
- Benutzerauthentifizierung

## Technologiestack

- **Frontend**: HTML, CSS, JavaScript (Framework je nach Implementierung)
- **Backend**: Node.js mit Express
- **Datenbank**: MongoDB
- **KI-Komponente**: Je nach Implementierung (z.B. TensorFlow, OpenAI API)

## Projektstruktur

```
buergervorschlaege/
├── ai/                # KI-Modelle und -Logik
├── backend/           # Express-Server und API-Endpoints
│   ├── config/        # Konfigurationsdateien
│   ├── models/        # MongoDB-Modelle
│   ├── public/        # Statische Assets
│   └── uploads/       # Hochgeladene Dateien
├── data/              # Datendefinitionen und -schemas
├── docs/              # Dokumentation
├── frontend/          # Frontend-Code
└── tests/             # Testdateien
```

## Einrichtung

### Voraussetzungen

- Node.js und npm
- MongoDB
- Git

### Installation

1. Repository klonen:

   ```
   git clone https://github.com/[username]/buergervorschlaege.git
   cd buergervorschlaege
   ```

2. Backend-Abhängigkeiten installieren:

   ```
   cd backend
   npm install
   ```

3. MongoDB einrichten:

   - Kopiere die `.env.example` Datei zu `.env`
   - Trage deine MongoDB-Verbindungsdaten ein

4. Server starten:
   ```
   npm start
   ```

### MongoDB-Konfiguration

Das System verwendet MongoDB als Datenbank. Füge deine MongoDB-Verbindungsdaten in die `.env`-Datei ein:

```
MONGODB_URI=mongodb://[username]:[password]@[hostname]:[port]/[database]
```

## Datenmodell

Das System verwendet folgende Hauptentitäten:

- **Benutzer** (User): Bürger, Ministeriumsmitarbeiter, Administratoren
- **Vorschläge** (Proposals): Von Bürgern eingereichte Ideen
- **Kategorien** (Categories): Thematische Bereiche für Vorschläge
- **Ministerien** (Ministries): Zuständige Regierungsbehörden
- **Kommentare** (Comments): Feedback zu Vorschlägen

## API-Endpunkte

Das Backend stellt folgende Hauptendpunkte bereit:

- `GET /api/proposals`: Alle Vorschläge abrufen
- `GET /api/proposals/:id`: Einen einzelnen Vorschlag abrufen
- `POST /api/proposals`: Neuen Vorschlag erstellen
- `PUT /api/proposals/:id`: Vorschlag aktualisieren
- `GET /api/categories`: Alle Kategorien abrufen
- `GET /api/ministries`: Alle Ministerien abrufen
- `GET /api/proposals/:id/comments`: Kommentare zu einem Vorschlag abrufen
- `POST /api/proposals/:id/comments`: Kommentar zu einem Vorschlag hinzufügen
- `GET /api/statistics`: Statistiken abrufen

## Beitragen

Beiträge zum Projekt sind willkommen! Bitte erstelle zunächst ein Issue, um Änderungen zu diskutieren, bevor du einen Pull Request einreichst.

## Lizenz

[Füge hier deine Lizenzinformationen hinzu]
