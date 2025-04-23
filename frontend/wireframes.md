# Wireframes für das Bürgerbeteiligungssystem

## Überblick

Dieses Dokument enthält die Wireframes für die Benutzeroberfläche des Bürgerbeteiligungssystems. Die Wireframes zeigen die grundlegende Struktur und den Aufbau der verschiedenen Seiten und Komponenten der Webseite.

## Allgemeine Struktur

Alle Seiten der Webseite folgen einer gemeinsamen Grundstruktur:

```
+---------------------------------------------------------------+
|                          HEADER                               |
|  Logo                                       Login/Profil      |
+---------------------------------------------------------------+
|                                                               |
|  Navigation                                                   |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|                                                               |
|                                                               |
|                       HAUPTINHALT                             |
|                                                               |
|                                                               |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
|                          FOOTER                               |
|                                                               |
+---------------------------------------------------------------+
```

## Startseite

Die Startseite bietet einen Überblick über das System und ermöglicht den schnellen Zugriff auf die wichtigsten Funktionen.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Home | Vorschläge | Kategorien | Über uns | Kontakt          |
+---------------------------------------------------------------+
|                                                               |
|  +---------------------------------------------------+        |
|  |                                                   |        |
|  |             HERO-BEREICH MIT SLOGAN               |        |
|  |                                                   |        |
|  |  +-------------------------------------------+    |        |
|  |  |        VORSCHLAG EINREICHEN BUTTON        |    |        |
|  |  +-------------------------------------------+    |        |
|  |                                                   |        |
|  +---------------------------------------------------+        |
|                                                               |
|  +------------------------+  +------------------------+       |
|  |                        |  |                        |       |
|  |   WIE ES FUNKTIONIERT  |  |   AKTUELLE STATISTIK   |       |
|  |                        |  |                        |       |
|  +------------------------+  +------------------------+       |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                AKTUELLE TOP-VORSCHLÄGE                |    |
|  |                                                       |    |
|  |  +-------------------+  +-------------------+         |    |
|  |  | Vorschlag 1       |  | Vorschlag 2       |         |    |
|  |  | Kategorie         |  | Kategorie         |         |    |
|  |  | Kurzbeschreibung  |  | Kurzbeschreibung  |         |    |
|  |  +-------------------+  +-------------------+         |    |
|  |                                                       |    |
|  |  +-------------------+  +-------------------+         |    |
|  |  | Vorschlag 3       |  | Vorschlag 4       |         |    |
|  |  | Kategorie         |  | Kategorie         |         |    |
|  |  | Kurzbeschreibung  |  | Kurzbeschreibung  |         |    |
|  |  +-------------------+  +-------------------+         |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                  AKTUELLE TRENDS                      |    |
|  |                                                       |    |
|  |  [Trend 1] [Trend 2] [Trend 3] [Trend 4] [Trend 5]    |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Vorschlag einreichen

Diese Seite ermöglicht es Bürgern, neue Vorschläge einzureichen.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Home | Vorschläge | Kategorien | Über uns | Kontakt          |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 VORSCHLAG EINREICHEN                  |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  Titel:                                               |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Kategorie:                                           |    |
|  |  +---------------------------------------------------+|    |
|  |  | [Dropdown-Menü mit Kategorien]                    ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Beschreibung:                                        |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  |                                                   ||    |
|  |  |                                                   ||    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Anhänge: [Datei auswählen]                           |    |
|  |                                                       |    |
|  |  [ ] Anonym einreichen                                |    |
|  |                                                       |    |
|  |  +-------------------+                                |    |
|  |  | Vorschlag senden  |                                |    |
|  |  +-------------------+                                |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                    HINWEISE                           |    |
|  |                                                       |    |
|  |  - Tipps für gute Vorschläge                          |    |
|  |  - Informationen zum Prozess                          |    |
|  |  - Datenschutzhinweise                                |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Vorschläge durchsuchen

Diese Seite ermöglicht es Benutzern, bestehende Vorschläge zu durchsuchen und zu filtern.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Home | Vorschläge | Kategorien | Über uns | Kontakt          |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 VORSCHLÄGE DURCHSUCHEN                |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------+  +-------------------------------+     |
|  |                   |  |                               |     |
|  |    FILTER         |  |       VORSCHLAGSLISTE         |     |
|  |                   |  |                               |     |
|  |  Kategorien:      |  |  +-------------------------+  |     |
|  |  [ ] Bildung      |  |  | Vorschlag 1             |  |     |
|  |  [ ] Umwelt       |  |  | Kategorie: Umwelt       |  |     |
|  |  [ ] Verkehr      |  |  | Status: In Bearbeitung  |  |     |
|  |  [ ] Gesundheit   |  |  | Datum: 01.03.2025       |  |     |
|  |  [ ] ...          |  |  | [Details anzeigen]      |  |     |
|  |                   |  |  +-------------------------+  |     |
|  |  Status:          |  |                               |     |
|  |  [ ] Eingereicht  |  |  +-------------------------+  |     |
|  |  [ ] In Bearbeitung|  |  | Vorschlag 2             |  |     |
|  |  [ ] Beantwortet  |  |  | Kategorie: Bildung      |  |     |
|  |  [ ] Abgeschlossen|  |  | Status: Eingereicht     |  |     |
|  |                   |  |  | Datum: 05.03.2025       |  |     |
|  |  Zeitraum:        |  |  | [Details anzeigen]      |  |     |
|  |  Von: [Datum]     |  |  +-------------------------+  |     |
|  |  Bis: [Datum]     |  |                               |     |
|  |                   |  |  +-------------------------+  |     |
|  |  Sortieren nach:  |  |  | Vorschlag 3             |  |     |
|  |  [Dropdown]       |  |  | Kategorie: Verkehr      |  |     |
|  |                   |  |  | Status: Beantwortet     |  |     |
|  |  [Filter anwenden]|  |  | Datum: 10.03.2025       |  |     |
|  |                   |  |  | [Details anzeigen]      |  |     |
|  +-------------------+  |  +-------------------------+  |     |
|                         |                               |     |
|                         |  +-------------------------+  |     |
|                         |  | Vorschlag 4             |  |     |
|                         |  | Kategorie: Gesundheit   |  |     |
|                         |  | Status: Abgeschlossen   |  |     |
|                         |  | Datum: 12.03.2025       |  |     |
|                         |  | [Details anzeigen]      |  |     |
|                         |  +-------------------------+  |     |
|                         |                               |     |
|                         |  [1] [2] [3] ... [Nächste >]  |     |
|                         |                               |     |
|                         +-------------------------------+     |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Vorschlagsdetails

Diese Seite zeigt die Details eines einzelnen Vorschlags.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Home | Vorschläge | Kategorien | Über uns | Kontakt          |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 VORSCHLAGSDETAILS                     |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |  Titel: Mehr Fahrradwege in der Innenstadt            |    |
|  |                                                       |    |
|  |  Eingereicht von: Max Mustermann (oder Anonym)        |    |
|  |  Datum: 01.03.2025                                    |    |
|  |  Kategorie: Verkehr, Umwelt                           |    |
|  |  Status: In Bearbeitung                               |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  |                                                   ||    |
|  |  |              VORSCHLAGSBESCHREIBUNG               ||    |
|  |  |                                                   ||    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Anhänge: [Anhang 1] [Anhang 2]                       |    |
|  |                                                       |    |
|  |  Zuständiges Ministerium: Bundesministerium für       |    |
|  |  Verkehr und digitale Infrastruktur                   |    |
|  |                                                       |    |
|  |  +-------------------+  +-------------------+         |    |
|  |  | Unterstützen      |  | Teilen            |         |    |
|  |  +-------------------+  +-------------------+         |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 STATUSVERLAUF                         |    |
|  |                                                       |    |
|  |  01.03.2025: Vorschlag eingereicht                    |    |
|  |  05.03.2025: Kategorisiert und weitergeleitet         |    |
|  |  10.03.2025: In Bearbeitung durch Ministerium         |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 KOMMENTARE                            |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Max Mustermann (05.03.2025):                      ||    |
|  |  | Ich finde diesen Vorschlag sehr wichtig, weil...  ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Ministerium für Verkehr (10.03.2025):             ||    |
|  |  | Wir prüfen derzeit die Umsetzbarkeit und...       ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Neuer Kommentar:                                     |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +-------------------+                                |    |
|  |  | Kommentar senden  |                                |    |
|  |  +-------------------+                                |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 ÄHNLICHE VORSCHLÄGE                   |    |
|  |                                                       |    |
|  |  - Ausbau des ÖPNV in der Innenstadt                  |    |
|  |  - Verkehrsberuhigte Zonen in der Altstadt            |    |
|  |  - Mehr Ladestationen für Elektrofahrräder            |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Benutzerprofil

Diese Seite zeigt das Profil eines angemeldeten Benutzers.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Home | Vorschläge | Kategorien | Über uns | Kontakt          |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 BENUTZERPROFIL                        |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------+  +-------------------------------+     |
|  |                   |  |                               |     |
|  |    NAVIGATION     |  |       PROFILINHALT            |     |
|  |                   |  |                               |     |
|  |  - Meine Vorschläge|  |  Persönliche Informationen   |     |
|  |  - Benachrichtigungen|  |  -------------------------   |     |
|  |  - Einstellungen  |  |                               |     |
|  |  - Abmelden       |  |  Name: Max Mustermann         |     |
|  |                   |  |  E-Mail: max@example.com      |     |
|  |                   |  |  Registriert seit: 01.01.2025 |     |
|  |                   |  |                               |     |
|  |                   |  |  [Profil bearbeiten]          |     |
|  |                   |  |                               |     |
|  |                   |  |  Interessen:                  |     |
|  |                   |  |  [Umwelt] [Verkehr] [+]       |     |
|  |                   |  |                               |     |
|  |                   |  |  Benachrichtigungseinstellungen:|     |
|  |                   |  |  [x] E-Mail bei Statusänderung |     |
|  |                   |  |  [x] E-Mail bei Kommentaren   |     |
|  |                   |  |  [ ] Wöchentliche Zusammenfassung|     |
|  |                   |  |                               |     |
|  |                   |  |  [Einstellungen speichern]    |     |
|  |                   |  |                               |     |
|  +-------------------+  +-------------------------------+     |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 MEINE VORSCHLÄGE                      |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Mehr Fahrradwege in der Innenstadt                ||    |
|  |  | Status: In Bearbeitung                            ||    |
|  |  | Eingereicht am: 01.03.2025                        ||    |
|  |  | [Details anzeigen]                                ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Förderung von Solaranlagen auf Schulgebäuden      ||    |
|  |  | Status: Eingereicht                               ||    |
|  |  | Eingereicht am: 15.03.2025                        ||    |
|  |  | [Details anzeigen]                                ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  [Alle meine Vorschläge anzeigen]                     |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 BENACHRICHTIGUNGEN                    |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Ihr Vorschlag wurde kategorisiert (05.03.2025)    ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Neuer Kommentar zu Ihrem Vorschlag (10.03.2025)   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  [Alle Benachrichtigungen anzeigen]                   |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Ministeriumsportal

Diese Seite zeigt das Dashboard für Ministeriumsmitarbeiter.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Dashboard | Vorschläge | Statistiken | Einstellungen         |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 MINISTERIUMSDASHBOARD                 |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------+  +-------------------------------+     |
|  |                   |  |                               |     |
|  |    ÜBERSICHT      |  |       NEUE VORSCHLÄGE         |     |
|  |                   |  |                               |     |
|  |  Offene Vorschläge:|  |  +-------------------------+  |     |
|  |  42                |  |  | Mehr Fahrradwege        |  |     |
|  |                   |  |  | Kategorie: Verkehr       |  |     |
|  |  In Bearbeitung:  |  |  | Priorität: Hoch          |  |     |
|  |  15                |  |  | [Details] [Zuweisen]     |  |     |
|  |                   |  |  +-------------------------+  |     |
|  |  Beantwortet:     |  |                               |     |
|  |  28                |  |  +-------------------------+  |     |
|  |                   |  |  | Digitale Ausstattung     |  |     |
|  |  Abgeschlossen:   |  |  | Kategorie: Bildung       |  |     |
|  |  95                |  |  | Priorität: Mittel       |  |     |
|  |                   |  |  | [Details] [Zuweisen]     |  |     |
|  |                   |  |  +-------------------------+  |     |
|  |  AKTUELLE TRENDS: |  |                               |     |
|  |  - Umweltschutz   |  |  +-------------------------+  |     |
|  |  - Digitalisierung|  |  | Grünflächen in der Stadt|  |     |
|  |  - ÖPNV           |  |  | Kategorie: Umwelt       |  |     |
|  |                   |  |  | Priorität: Mittel       |  |     |
|  +-------------------+  |  | [Details] [Zuweisen]     |  |     |
|                         |  +-------------------------+  |     |
|                         |                               |     |
|                         |  [Alle neuen Vorschläge]      |     |
|                         |                               |     |
|                         +-------------------------------+     |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 MEINE ZUGEWIESENEN VORSCHLÄGE         |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Ausbau des ÖPNV                                   ||    |
|  |  | Status: In Bearbeitung                            ||    |
|  |  | Frist: 20.04.2025                                 ||    |
|  |  | [Bearbeiten]                                      ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Förderung erneuerbarer Energien                   ||    |
|  |  | Status: In Bearbeitung                            ||    |
|  |  | Frist: 25.04.2025                                 ||    |
|  |  | [Bearbeiten]                                      ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  [Alle meine Vorschläge]                              |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 STATISTIKEN                           |    |
|  |                                                       |    |
|  |  [Grafik: Vorschläge pro Kategorie]                   |    |
|  |  [Grafik: Bearbeitungszeiten]                         |    |
|  |                                                       |    |
|  |  [Detaillierte Statistiken anzeigen]                  |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Vorschlagsbearbeitung (Ministerium)

Diese Seite ermöglicht es Ministeriumsmitarbeitern, einen Vorschlag zu bearbeiten.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Dashboard | Vorschläge | Statistiken | Einstellungen         |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 VORSCHLAG BEARBEITEN                  |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------+  +-------------------------------+     |
|  |                   |  |                               |     |
|  |    DETAILS        |  |       BEARBEITUNGSBEREICH     |     |
|  |                   |  |                               |     |
|  |  ID: V-12345      |  |  Status ändern:               |     |
|  |  Eingereicht: 01.03.2025|  |  [Dropdown: In Bearbeitung]   |     |
|  |  Von: Max Mustermann|  |                               |     |
|  |  Kategorie: Verkehr|  |  Zuständiger Mitarbeiter:     |     |
|  |  Priorität: Hoch   |  |  [Dropdown: Mitarbeiterliste] |     |
|  |                   |  |                               |     |
|  |  KI-Analyse:      |  |  Interne Notizen:             |     |
|  |  - Relevanz: 4.5/5|  |  +-------------------------+  |     |
|  |  - Umsetzbarkeit: 3.8/5|  |  |                         |  |     |
|  |  - Qualität: 4.2/5|  |  +-------------------------+  |     |
|  |                   |  |                               |     |
|  |  Ähnliche Vorschläge:|  |  Offizielle Antwort:          |     |
|  |  - Ausbau des ÖPNV|  |  +-------------------------+  |     |
|  |  - Verkehrsberuhigung|  |  |                         |  |     |
|  |                   |  |  |                         |  |     |
|  |                   |  |  |                         |  |     |
|  |                   |  |  +-------------------------+  |     |
|  |                   |  |                               |     |
|  |                   |  |  +-------------------+        |     |
|  |                   |  |  | Antwort speichern |        |     |
|  |                   |  |  +-------------------+        |     |
|  +-------------------+  |                               |     |
|                         |  Vorschlag weiterleiten an:   |     |
|                         |  [Dropdown: Ministeriumsliste]|     |
|                         |  +-------------------+        |     |
|                         |  | Weiterleiten      |        |     |
|                         |  +-------------------+        |     |
|                         |                               |     |
|                         +-------------------------------+     |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 VORSCHLAGSINHALT                      |    |
|  |                                                       |    |
|  |  Titel: Mehr Fahrradwege in der Innenstadt            |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  |              VORSCHLAGSBESCHREIBUNG               ||    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Anhänge: [Anhang 1] [Anhang 2]                       |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 KOMMUNIKATIONSVERLAUF                 |    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | System (01.03.2025):                              ||    |
|  |  | Vorschlag eingereicht                             ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | System (05.03.2025):                              ||    |
|  |  | Vorschlag kategorisiert und weitergeleitet        ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  +---------------------------------------------------+|    |
|  |  | Max Mustermann (07.03.2025):                      ||    |
|  |  | Gibt es schon Neuigkeiten zu meinem Vorschlag?    ||    |
|  |  +---------------------------------------------------+|    |
|  |                                                       |    |
|  |  Neue interne Notiz:                                  |    |
|  |  +---------------------------------------------------+|    |
|  |  |                                                   ||    |
|  |  +---------------------------------------------------+|    |
|  |  [Notiz hinzufügen]                                   |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Statistiken und Reporting

Diese Seite zeigt Statistiken und Berichte für Ministeriumsmitarbeiter.

```
+---------------------------------------------------------------+
|                          HEADER                               |
+---------------------------------------------------------------+
|  Dashboard | Vorschläge | Statistiken | Einstellungen         |
+---------------------------------------------------------------+
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 STATISTIKEN & BERICHTE                |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------+  +-------------------------------+     |
|  |                   |  |                               |     |
|  |    FILTER         |  |       HAUPTSTATISTIKEN        |     |
|  |                   |  |                               |     |
|  |  Zeitraum:        |  |  [Grafik: Vorschläge pro Monat]|     |
|  |  Von: [Datum]     |  |                               |     |
|  |  Bis: [Datum]     |  |  [Grafik: Vorschläge nach     |     |
|  |                   |  |   Kategorien]                 |     |
|  |  Kategorien:      |  |                               |     |
|  |  [Mehrfachauswahl]|  |  [Grafik: Bearbeitungsstatus] |     |
|  |                   |  |                               |     |
|  |  Status:          |  |  [Grafik: Durchschnittliche   |     |
|  |  [Mehrfachauswahl]|  |   Bearbeitungszeit]           |     |
|  |                   |  |                               |     |
|  |  [Filter anwenden]|  |                               |     |
|  |                   |  |                               |     |
|  |  Berichte:        |  |                               |     |
|  |  [Monatsbericht]  |  |                               |     |
|  |  [Kategoriebericht]|  |                               |     |
|  |  [Trendbericht]   |  |                               |     |
|  |                   |  |                               |     |
|  |  Export:          |  |                               |     |
|  |  [CSV exportieren]|  |                               |     |
|  |  [PDF exportieren]|  |                               |     |
|  |                   |  |                               |     |
|  +-------------------+  +-------------------------------+     |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 TRENDANALYSE                          |    |
|  |                                                       |    |
|  |  Top-Themen im ausgewählten Zeitraum:                 |    |
|  |                                                       |    |
|  |  1. Umweltschutz (42 Vorschläge, +15% zum Vormonat)   |    |
|  |  2. Digitalisierung (38 Vorschläge, +22% zum Vormonat)|    |
|  |  3. ÖPNV (35 Vorschläge, +5% zum Vormonat)            |    |
|  |  4. Bildung (29 Vorschläge, -3% zum Vormonat)         |    |
|  |  5. Gesundheit (24 Vorschläge, +8% zum Vormonat)      |    |
|  |                                                       |    |
|  |  [Detaillierte Trendanalyse anzeigen]                 |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
|  +-------------------------------------------------------+    |
|  |                                                       |    |
|  |                 LEISTUNGSKENNZAHLEN                   |    |
|  |                                                       |    |
|  |  Durchschnittliche Bearbeitungszeit: 12 Tage          |    |
|  |  Vorschläge pro Mitarbeiter: 8,5                      |    |
|  |  Abschlussquote: 68%                                  |    |
|  |  Bürgerzufriedenheit: 4,2/5                           |    |
|  |                                                       |    |
|  |  [Detaillierte Leistungsanalyse anzeigen]             |    |
|  |                                                       |    |
|  +-------------------------------------------------------+    |
|                                                               |
+---------------------------------------------------------------+
|                          FOOTER                               |
+---------------------------------------------------------------+
```

## Responsive Design

Alle Seiten werden für verschiedene Bildschirmgrößen optimiert:

### Mobile Ansicht (Beispiel: Startseite)

```
+---------------------------+
|         HEADER            |
+---------------------------+
| [Menü] Logo      [Profil] |
+---------------------------+
|                           |
|      HERO-BEREICH         |
|                           |
|  VORSCHLAG EINREICHEN     |
|                           |
+---------------------------+
|                           |
|   WIE ES FUNKTIONIERT     |
|                           |
+---------------------------+
|                           |
|   AKTUELLE STATISTIK      |
|                           |
+---------------------------+
|                           |
|  AKTUELLE TOP-VORSCHLÄGE  |
|                           |
|  +---------------------+  |
|  | Vorschlag 1         |  |
|  | Kategorie           |  |
|  | Kurzbeschreibung    |  |
|  +---------------------+  |
|                           |
|  +---------------------+  |
|  | Vorschlag 2         |  |
|  | Kategorie           |  |
|  | Kurzbeschreibung    |  |
|  +---------------------+  |
|                           |
+---------------------------+
|                           |
|     AKTUELLE TRENDS       |
|                           |
|  [Trend 1] [Trend 2]      |
|  [Trend 3] [Trend 4]      |
|                           |
+---------------------------+
|         FOOTER            |
+---------------------------+
```

### Tablet Ansicht (Beispiel: Vorschläge durchsuchen)

```
+------------------------------------------+
|                HEADER                    |
+------------------------------------------+
| Home | Vorschläge | Kategorien | Kontakt |
+------------------------------------------+
|                                          |
|          VORSCHLÄGE DURCHSUCHEN          |
|                                          |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |           FILTER                   |  |
|  |                                    |  |
|  | Kategorien: [Dropdown]             |  |
|  | Status: [Dropdown]                 |  |
|  | Zeitraum: Von [Datum] Bis [Datum]  |  |
|  | [Filter anwenden]                  |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Vorschlag 1                        |  |
|  | Kategorie: Umwelt                  |  |
|  | Status: In Bearbeitung             |  |
|  | Datum: 01.03.2025                  |  |
|  | [Details anzeigen]                 |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Vorschlag 2                        |  |
|  | Kategorie: Bildung                 |  |
|  | Status: Eingereicht                |  |
|  | Datum: 05.03.2025                  |  |
|  | [Details anzeigen]                 |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Vorschlag 3                        |  |
|  | Kategorie: Verkehr                 |  |
|  | Status: Beantwortet                |  |
|  | Datum: 10.03.2025                  |  |
|  | [Details anzeigen]                 |  |
|  +------------------------------------+  |
|                                          |
|  [1] [2] [3] ... [Nächste >]             |
|                                          |
+------------------------------------------+
|                FOOTER                    |
+------------------------------------------+
```

Diese Wireframes bilden die Grundlage für die Entwicklung der Benutzeroberfläche des Bürgerbeteiligungssystems und werden im nächsten Schritt in ein detailliertes Design umgesetzt.
