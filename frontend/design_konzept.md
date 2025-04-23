# Design-Konzept für das Bürgerbeteiligungssystem

## Designphilosophie

Das Design des Bürgerbeteiligungssystems folgt einer klaren, benutzerfreundlichen und inklusiven Gestaltungsphilosophie. Es soll allen Bürgern, unabhängig von ihren technischen Fähigkeiten oder Einschränkungen, einen einfachen Zugang zur politischen Beteiligung ermöglichen.

### Kernprinzipien

1. **Zugänglichkeit**: Das Design erfüllt WCAG 2.1 AA-Standards, um Barrierefreiheit zu gewährleisten.
2. **Benutzerfreundlichkeit**: Intuitive Navigation und klare Handlungsaufforderungen.
3. **Vertrauenswürdigkeit**: Professionelles Erscheinungsbild, das Vertrauen und Seriosität vermittelt.
4. **Transparenz**: Klare Darstellung von Prozessen und Entscheidungen.
5. **Responsivität**: Optimale Darstellung auf allen Geräten.

## Farbschema

Das Farbschema kombiniert vertrauenswürdige, offizielle Farbtöne mit frischen Akzenten, die Modernität und Offenheit symbolisieren.

### Primärfarben

- **Dunkelblau** (#1A365D): Hauptfarbe, vermittelt Vertrauen und Seriosität
- **Mittelblau** (#2A6496): Sekundäre Farbe für Hervorhebungen und Übergänge
- **Hellblau** (#4A90E2): Akzentfarbe für interaktive Elemente

### Sekundärfarben

- **Grün** (#34A853): Positive Aktionen, Erfolg, Fortschritt
- **Orange** (#FBBC05): Warnungen, Aufmerksamkeit
- **Rot** (#EA4335): Fehler, wichtige Hinweise

### Neutrale Farben

- **Weiß** (#FFFFFF): Hintergrund, saubere Flächen
- **Hellgrau** (#F5F5F5): Sekundäre Hintergründe, Abschnittstrennungen
- **Mittelgrau** (#9AA0A6): Nicht-interaktiver Text, Platzhalter
- **Dunkelgrau** (#3C4043): Haupttextfarbe

### Farbverwendung

- Text auf dunklem Hintergrund: Weiß (#FFFFFF)
- Text auf hellem Hintergrund: Dunkelgrau (#3C4043)
- Links und interaktive Elemente: Hellblau (#4A90E2)
- Buttons: Dunkelblau (#1A365D) mit weißem Text
- Erfolgshinweise: Grün (#34A853)
- Warnungen: Orange (#FBBC05)
- Fehler: Rot (#EA4335)

## Typografie

Die Typografie ist klar, lesbar und hierarchisch strukturiert.

### Schriftarten

- **Hauptschrift**: Roboto
  - Eine moderne, gut lesbare Sans-Serif-Schrift
  - Verfügbar in verschiedenen Gewichten für flexible Gestaltung
  - Gute Unterstützung für verschiedene Sprachen und Zeichen

- **Überschriften**: Roboto Slab
  - Serifen-Variante für Überschriften
  - Schafft visuelle Hierarchie und Unterscheidung

### Schriftgrößen

- **Überschrift 1**: 32px (2rem), Roboto Slab Bold
- **Überschrift 2**: 24px (1.5rem), Roboto Slab Bold
- **Überschrift 3**: 20px (1.25rem), Roboto Slab Medium
- **Überschrift 4**: 18px (1.125rem), Roboto Medium
- **Fließtext**: 16px (1rem), Roboto Regular
- **Kleiner Text**: 14px (0.875rem), Roboto Regular
- **Sehr kleiner Text**: 12px (0.75rem), Roboto Regular

### Zeilenabstand

- Überschriften: 1.2
- Fließtext: 1.5
- Listen und Absätze: 1.6

## Komponenten

### Buttons

#### Primäre Buttons
- Hintergrund: Dunkelblau (#1A365D)
- Text: Weiß (#FFFFFF)
- Padding: 12px 24px
- Border-Radius: 4px
- Hover-Effekt: Leichte Verdunkelung, Schatten
- Aktiv-Effekt: Eindrücken (leichte Verkleinerung)

#### Sekundäre Buttons
- Hintergrund: Weiß (#FFFFFF)
- Text: Dunkelblau (#1A365D)
- Border: 1px solid Dunkelblau (#1A365D)
- Padding: 12px 24px
- Border-Radius: 4px
- Hover-Effekt: Hellblauer Hintergrund (#F0F8FF)

#### Tertiäre Buttons (Links)
- Text: Hellblau (#4A90E2)
- Unterstreichung: Keine (nur bei Hover)
- Hover-Effekt: Unterstreichung

#### Deaktivierte Buttons
- Hintergrund: Hellgrau (#F5F5F5)
- Text: Mittelgrau (#9AA0A6)
- Cursor: not-allowed

### Formulare

#### Eingabefelder
- Hintergrund: Weiß (#FFFFFF)
- Border: 1px solid Mittelgrau (#9AA0A6)
- Border-Radius: 4px
- Padding: 12px
- Fokus-Effekt: 2px Outline in Hellblau (#4A90E2)
- Fehler-Zustand: 1px solid Rot (#EA4335)

#### Labels
- Text: Dunkelgrau (#3C4043)
- Schriftgröße: 14px
- Margin-Bottom: 8px

#### Checkboxen und Radio-Buttons
- Größe: 18px × 18px
- Ausgewählt: Dunkelblau (#1A365D)
- Border: 1px solid Mittelgrau (#9AA0A6)

#### Dropdown-Menüs
- Ähnlich wie Eingabefelder
- Pfeil-Icon: Dunkelgrau (#3C4043)
- Dropdown-Liste: Weiß mit 1px Border und Schatten

### Karten

#### Vorschlagskarten
- Hintergrund: Weiß (#FFFFFF)
- Border: 1px solid Hellgrau (#E0E0E0)
- Border-Radius: 8px
- Schatten: 0 2px 4px rgba(0,0,0,0.1)
- Padding: 16px
- Hover-Effekt: Leichter Schatten-Anstieg

#### Statuskarten
- Ähnlich wie Vorschlagskarten
- Farbiger oberer Rand (4px) je nach Status:
  - Eingereicht: Hellblau (#4A90E2)
  - In Bearbeitung: Orange (#FBBC05)
  - Beantwortet: Grün (#34A853)
  - Abgeschlossen: Dunkelgrau (#3C4043)

### Navigation

#### Hauptnavigation
- Hintergrund: Weiß (#FFFFFF)
- Text: Dunkelgrau (#3C4043)
- Aktiver Link: Dunkelblau (#1A365D)
- Unterstreichung: 2px solid Dunkelblau für aktiven Link
- Hover-Effekt: Hellblau (#4A90E2)

#### Breadcrumbs
- Text: Mittelgrau (#9AA0A6)
- Trennzeichen: Pfeil-Icon in Mittelgrau
- Aktueller Punkt: Dunkelgrau (#3C4043)

#### Pagination
- Buttons: Ähnlich wie sekundäre Buttons
- Aktive Seite: Dunkelblau (#1A365D) mit weißem Text

### Benachrichtigungen

#### Erfolg
- Hintergrund: Hellgrün (#E6F4EA)
- Icon: Grün (#34A853)
- Border-Left: 4px solid Grün (#34A853)

#### Warnung
- Hintergrund: Hellorange (#FEF7E0)
- Icon: Orange (#FBBC05)
- Border-Left: 4px solid Orange (#FBBC05)

#### Fehler
- Hintergrund: Hellrot (#FADBD8)
- Icon: Rot (#EA4335)
- Border-Left: 4px solid Rot (#EA4335)

#### Info
- Hintergrund: Hellblau (#E8F0FE)
- Icon: Hellblau (#4A90E2)
- Border-Left: 4px solid Hellblau (#4A90E2)

### Tabellen

#### Kopfzeile
- Hintergrund: Hellgrau (#F5F5F5)
- Text: Dunkelgrau (#3C4043)
- Font-Weight: Medium

#### Zeilen
- Hintergrund: Weiß (#FFFFFF)
- Alternierende Zeilen: Sehr helles Grau (#FAFAFA)
- Border-Bottom: 1px solid Hellgrau (#E0E0E0)

#### Interaktive Zeilen
- Hover-Effekt: Hellblau (#F0F8FF)
- Cursor: pointer

## Icons

Das System verwendet eine konsistente Icon-Bibliothek, die Klarheit und Verständlichkeit fördert.

### Icon-Set
- Material Icons als Basis
- Konsistente Linienstärke und Stil
- Größen: 16px, 24px, 32px

### Verwendung
- Navigationselemente: 24px
- Aktionsbuttons: 16px
- Feature-Icons: 32px
- Status-Icons: 24px

### Beispiele
- Vorschlag einreichen: Stift-Icon
- Suchen: Lupe-Icon
- Filtern: Trichter-Icon
- Status: Verschiedene Icons je nach Status (Uhr, Checkmark, etc.)

## Bilder und Illustrationen

### Stil
- Moderne, flache Illustrationen
- Konsistenter Stil über die gesamte Plattform
- Inklusiv und divers in der Darstellung von Menschen

### Verwendung
- Hero-Bereich: Große, aussagekräftige Illustration
- Feature-Erklärungen: Kleinere, fokussierte Illustrationen
- Leere Zustände: Freundliche Illustrationen mit Handlungsaufforderungen

### Fotos
- Hochwertige, authentische Fotos
- Fokus auf Bürger, Gemeinschaft und Engagement
- Vermeidung von Stockfoto-Klischees

## Layouts

### Raster
- 12-Spalten-Raster für Desktop
- 8-Spalten-Raster für Tablet
- 4-Spalten-Raster für Mobile
- Gutter: 24px auf Desktop, 16px auf Tablet, 8px auf Mobile

### Abstände
- Basis-Einheit: 8px
- Abschnitte: 48px Abstand (Desktop), 32px (Tablet/Mobile)
- Komponenten: 24px Abstand
- Innere Abstände: 16px

### Container
- Maximale Breite: 1200px
- Seitenränder: Auto (zentriert)
- Padding: 24px auf Desktop, 16px auf Tablet, 8px auf Mobile

## Responsive Design

### Breakpoints
- Mobile: 0-767px
- Tablet: 768px-1023px
- Desktop: 1024px+

### Anpassungen
- **Navigation**: Wechsel zu Hamburger-Menü auf Mobile
- **Karten**: Stapel statt Raster auf Mobile
- **Tabellen**: Horizontales Scrollen oder alternative Darstellung auf Mobile
- **Formulare**: Volle Breite auf Mobile
- **Typografie**: Reduzierte Größen auf Mobile (Basis: 14px)

## Animationen und Übergänge

### Prinzipien
- Subtil und zweckmäßig
- Unterstützung des Verständnisses
- Nicht ablenkend oder verzögernd

### Beispiele
- Hover-Effekte: 0.2s Übergang
- Dropdown-Menüs: Sanftes Ein-/Ausblenden (0.3s)
- Seitenwechsel: Leichtes Fade-In (0.4s)
- Benachrichtigungen: Slide-In von oben (0.3s)

## Barrierefreiheit

### Kontraste
- Alle Text-Hintergrund-Kombinationen erfüllen WCAG AA-Standards
- Primäre Inhalte erfüllen WCAG AAA-Standards

### Fokus-Zustände
- Deutlich sichtbare Fokus-Indikatoren
- Konsistente Darstellung über alle interaktiven Elemente

### Screenreader-Unterstützung
- Semantisches HTML
- ARIA-Labels wo nötig
- Sinnvolle Alt-Texte für Bilder

### Tastaturnavigation
- Vollständige Bedienbarkeit ohne Maus
- Logische Tab-Reihenfolge
- Shortcuts für häufige Aktionen

## Design-Beispiele

### Startseite

Die Startseite präsentiert das System mit einem klaren Fokus auf die Hauptfunktion: das Einreichen von Vorschlägen.

```
+---------------------------------------------------------------+
|                          HEADER                               |
| [Logo in Dunkelblau]                  [Login-Button: Primär]  |
+---------------------------------------------------------------+
| [Navigation: Dunkelgrau, aktiver Link mit blauem Unterstrich] |
+---------------------------------------------------------------+
|                                                               |
|  +---------------------------------------------------+        |
|  |                                                   |        |
|  |  [Hintergrundbild: Diverse Bürgergruppe]          |        |
|  |  [Überschrift H1: Ihre Ideen für eine bessere     |        |
|  |   Politik - in Dunkelblau]                        |        |
|  |  [Untertext: Hellerer Dunkelgrau]                 |        |
|  |                                                   |        |
|  |  [Primär-Button: Vorschlag einreichen]            |        |
|  |                                                   |        |
|  +---------------------------------------------------+        |
|                                                               |
|  +------------------------+  +------------------------+       |
|  | [Icon: 32px]           |  | [Icon: 32px]           |       |
|  | [Überschrift H3]       |  | [Überschrift H3]       |       |
|  | [Text: Dunkelgrau]     |  | [Zahlen: Groß, Blau]   |       |
|  | [Link: Hellblau]       |  | [Text: Dunkelgrau]     |       |
|  +------------------------+  +------------------------+       |
|                                                               |
|  [Überschrift H2: Top-Vorschläge - in Dunkelblau]             |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  +-------------------+  +-------------------+         |    |
|  |  | [Karte: Weiß mit  |  | [Karte: Weiß mit  |         |    |
|  |  |  leichtem Schatten]|  |  leichtem Schatten]|         |    |
|  |  | [Titel: H4, Blau] |  | [Titel: H4, Blau] |         |    |
|  |  | [Kategorie-Badge] |  | [Kategorie-Badge] |         |    |
|  |  | [Text: Dunkelgrau]|  | [Text: Dunkelgrau]|         |    |
|  |  | [Link: Details]   |  | [Link: Details]   |         |    |
|  |  +-------------------+  +-------------------+         |    |
|  |                                                       |    |
|  |  +-------------------+  +-------------------+         |    |
|  |  | [Karte]           |  | [Karte]           |         |    |
|  |  | ...               |  | ...               |         |    |
|  |  +-------------------+  +-------------------+         |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  [Überschrift H2: Aktuelle Trends - in Dunkelblau]            |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  [Trend-Tags: Abgerundete Rechtecke in Hellblau]      |    |
|  |  [#Umweltschutz] [#Digitalisierung] [#ÖPNV]           |    |
|  |  [#Bildung] [#Gesundheit]                             |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
| [Logo: Klein, Weiß]  [Links: Weiß]  [Social Media Icons]      |
| [Copyright-Text: Hellgrau]                                    |
+---------------------------------------------------------------+
```

### Vorschlagsdetails

Die Detailseite eines Vorschlags präsentiert alle relevanten Informationen übersichtlich und ermöglicht Interaktion.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  [Breadcrumbs: Home > Vorschläge > Vorschlagsdetails]         |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  [Überschrift H1: Vorschlagstitel - in Dunkelblau]    |    |
|  |                                                       |    |
|  |  [Metadaten-Leiste: Hellgrau Hintergrund]             |    |
|  |  Eingereicht von: Max Mustermann | 01.03.2025         |    |
|  |  [Kategorie-Badges: Abgerundete Rechtecke in Blautönen]|    |
|  |  [Status-Badge: Farbig je nach Status]                |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  |  [Vorschlagsbeschreibung: Gut strukturierter Text]||    |
|  |  |  [Absätze mit 1.5 Zeilenabstand]                 ||    |
|  |  |  [Links: Hellblau]                               ||    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  [Anhänge-Bereich: Leicht abgesetzt]                  |    |
|  |  [Anhang-Icons mit Dateinamen: Hellblau Links]        |    |
|  |                                                       |    |
|  |  [Info-Box: Hellblau Hintergrund, abgerundet]         |    |
|  |  Zuständiges Ministerium: Bundesministerium für...    |    |
|  |                                                       |    |
|  |  [Aktionsleiste]                                      |    |
|  |  [Primär-Button: Unterstützen mit Zähler]             |    |
|  |  [Sekundär-Button: Teilen mit Icon]                   |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  [Tabs-Navigation: Unterstrichener aktiver Tab]               |
|  [Statusverlauf | Kommentare | Ähnliche Vorschläge]           |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  [Timeline-Darstellung mit Punkten und Linien]        |    |
|  |  [Datum: Hellgrau] Vorschlag eingereicht              |    |
|  |  [Icon: Blau]                                         |    |
|  |                                                       |    |
|  |  [Datum: Hellgrau] Kategorisiert und weitergeleitet   |    |
|  |  [Icon: Blau]                                         |    |
|  |                                                       |    |
|  |  [Datum: Hellgrau] In Bearbeitung durch Ministerium   |    |
|  |  [Icon: Orange]                                       |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Designsystem-Dokumentation

Das vollständige Designsystem wird in einer separaten Dokumentation festgehalten, die folgende Elemente enthält:

1. **Styleguide**: Detaillierte Dokumentation aller Design-Elemente
2. **Komponenten-Bibliothek**: Wiederverwendbare UI-Komponenten mit Varianten
3. **Muster-Bibliothek**: Häufig verwendete UI-Muster und deren Anwendung
4. **Prinzipien und Richtlinien**: Grundlegende Designprinzipien und Anwendungsrichtlinien

Diese Dokumentation dient als Referenz für die Entwicklung und gewährleistet ein konsistentes Erscheinungsbild über alle Teile des Systems hinweg.

## Implementierungshinweise

Bei der Umsetzung des Designs sind folgende Punkte zu beachten:

1. **CSS-Variablen**: Verwendung von CSS-Variablen für Farben, Abstände und Typografie
2. **Komponenten-basierter Ansatz**: Entwicklung wiederverwendbarer Komponenten
3. **Responsive-First**: Mobile-First-Entwicklung mit progressiver Erweiterung
4. **Barrierefreiheit**: Kontinuierliche Tests mit Screenreadern und Tastaturnavigation
5. **Performance**: Optimierung von Bildern und Animationen für schnelle Ladezeiten

Das Design wird in einem iterativen Prozess umgesetzt, beginnend mit den Kernkomponenten und schrittweiser Erweiterung auf alle Seitentypen.
