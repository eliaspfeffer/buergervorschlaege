# Trainingsdaten für das KI-Modell zur Vorschlagsverarbeitung

## Überblick

Dieses Dokument beschreibt die Trainingsdaten, die für die Entwicklung und das Training des KI-Modells zur Verarbeitung von Bürgervorschlägen benötigt werden. Die Trainingsdaten sind entscheidend für die Leistungsfähigkeit des Modells und müssen sorgfältig ausgewählt, aufbereitet und annotiert werden.

## Datenquellen

### 1. Simulierte Bürgervorschläge

**Beschreibung:**
- Künstlich erstellte Vorschläge, die reale Bürgeranliegen simulieren
- Abdeckung verschiedener Themenbereiche, Komplexitätsgrade und Schreibstile
- Systematische Variation von Länge, Formalität und Detailgrad

**Umfang:**
- Mindestens 2.000 simulierte Vorschläge
- Gleichmäßige Verteilung über alle definierten Kategorien
- Verschiedene Qualitätsstufen (von sehr gut bis mangelhaft)

**Erstellungsmethode:**
- Erstellung durch Fachexperten aus verschiedenen Ministerien
- Teilweise Generierung mit Hilfe von GPT-4 oder ähnlichen Sprachmodellen mit anschließender menschlicher Überprüfung
- Systematische Abdeckung typischer Anliegen basierend auf realen Bürgereingaben

### 2. Öffentliche Petitionen und Bürgereingaben

**Beschreibung:**
- Anonymisierte und bereinigte Daten aus öffentlichen Petitionsplattformen
- Reale Bürgereingaben aus bestehenden Beteiligungsverfahren (mit Genehmigung)
- Öffentlich zugängliche Vorschläge aus kommunalen Beteiligungsprozessen

**Umfang:**
- 1.000-1.500 reale Vorschläge und Petitionen
- Fokus auf Vielfalt der Themen und Ausdrucksweisen
- Dokumentation der Herkunft und rechtlichen Grundlage für die Nutzung

**Beschaffungsmethode:**
- Kooperation mit bestehenden Petitionsplattformen
- Anfragen bei Kommunen und Ländern für anonymisierte Daten
- Web-Scraping öffentlich zugänglicher Vorschläge mit entsprechender Genehmigung

### 3. Synthetisch generierte Beispiele

**Beschreibung:**
- Künstlich erzeugte Vorschläge für unterrepräsentierte Kategorien
- Gezielte Erstellung von Grenzfällen und schwierigen Beispielen
- Systematische Variation von Eigenschaften für robustes Training

**Umfang:**
- 500-1.000 synthetische Beispiele
- Fokus auf Kategorien mit wenigen realen Beispielen
- Spezielle Testfälle für Mehrfachkategorisierung und Grenzfälle

**Erstellungsmethode:**
- Einsatz von Sprachmodellen mit spezifischen Prompts
- Regelbasierte Transformation existierender Beispiele
- Gezielte Erstellung durch Domänenexperten

### 4. Expertengenerierte Beispiele

**Beschreibung:**
- Von Fachexperten erstellte Beispiele für spezifische Herausforderungen
- Hochwertige Referenzbeispiele für verschiedene Qualitätsstufen
- Spezielle Beispiele für Duplikaterkennung und Ähnlichkeitsanalyse

**Umfang:**
- 200-300 Expertenbeispiele
- Fokus auf Qualität und spezifische Herausforderungen
- Dokumentation der Erstellungsintention und erwarteten Modellreaktion

**Erstellungsmethode:**
- Workshops mit Ministeriumsmitarbeitern und Fachexperten
- Gezielte Erstellung basierend auf identifizierten Schwachstellen des Modells
- Iterative Verfeinerung basierend auf Modellergebnissen

## Datenannotation

### 1. Kategorisierungsannotation

**Annotationsschema:**
- Primäre Kategorie (Hauptthema des Vorschlags)
- Sekundäre Kategorien (weitere relevante Themen)
- Konfidenzwerte für jede Kategorie (1-5)
- Zuständige Ministerien basierend auf Kategorien

**Annotationsprozess:**
- Initiale Annotation durch zwei unabhängige Annotatoren
- Konfliktlösung durch einen dritten Annotator oder Konsensverfahren
- Qualitätskontrolle durch Stichprobenüberprüfung von Experten
- Berechnung von Inter-Annotator-Agreement (Cohen's Kappa)

**Annotationsrichtlinien:**
- Detaillierte Richtlinien für jede Kategorie mit Beispielen
- Entscheidungsbaum für Grenzfälle
- Regeln für Mehrfachkategorisierung
- Schwellenwerte für Konfidenzwerte

### 2. Qualitätsbewertungsannotation

**Annotationsschema:**
- Relevanz (1-5): Bedeutung für die öffentliche Verwaltung
- Umsetzbarkeit (1-5): Praktische Realisierbarkeit
- Klarheit (1-5): Verständlichkeit und Präzision
- Konstruktivität (1-5): Lösungsorientierung und Sachlichkeit
- Gesamtqualität (1-5): Übergreifende Bewertung

**Annotationsprozess:**
- Annotation durch Experten aus relevanten Fachbereichen
- Mindestens drei unabhängige Bewertungen pro Vorschlag
- Berechnung von Durchschnittswerten und Standardabweichungen
- Dokumentation von Begründungen für extreme Bewertungen

**Annotationsrichtlinien:**
- Detaillierte Bewertungskriterien für jede Dimension
- Beispiele für verschiedene Qualitätsstufen
- Vermeidung von Bias durch klare objektive Kriterien
- Regelmäßige Kalibrierungssitzungen für Annotatoren

### 3. Ähnlichkeits- und Duplikatannotation

**Annotationsschema:**
- Paarweise Ähnlichkeitsbewertung (1-5)
- Duplikatstatus (exaktes Duplikat, inhaltliches Duplikat, ähnlich, unterschiedlich)
- Begründung für Ähnlichkeitsbewertung
- Gruppierung in Themencluster

**Annotationsprozess:**
- Initiale automatische Vorauswahl potenziell ähnlicher Vorschläge
- Manuelle Bewertung durch Annotatoren
- Stichprobenartige Überprüfung zufälliger Paare zur Validierung
- Iterative Verfeinerung der Ähnlichkeitskriterien

**Annotationsrichtlinien:**
- Definition verschiedener Ähnlichkeitsarten (wörtlich, thematisch, konzeptionell)
- Schwellenwerte für Duplikaterkennung
- Beispiele für verschiedene Ähnlichkeitsstufen
- Protokoll für die Behandlung von Grenzfällen

## Datenaufbereitung

### 1. Vorverarbeitung

**Textbereinigung:**
- Entfernung von Sonderzeichen und irrelevanten Formatierungen
- Korrektur offensichtlicher Rechtschreibfehler
- Normalisierung von Abkürzungen und Schreibweisen
- Entfernung persönlicher Identifikationsmerkmale

**Strukturierung:**
- Einheitliches Format für alle Vorschläge
- Trennung von Metadaten und Textinhalt
- Konsistente Kodierung (UTF-8)
- Standardisierte Längenformate

**Anreicherung:**
- Extraktion linguistischer Merkmale (Satzlänge, Komplexität, etc.)
- Berechnung statistischer Kennzahlen (Wortanzahl, Lesbarkeitsindex, etc.)
- Identifikation von Fachbegriffen und Entitäten
- Hinzufügen von Metadaten (Quelle, Erstellungsdatum, etc.)

### 2. Datensplitting

**Trainingsdaten (70%):**
- Hauptdatensatz für das Modelltraining
- Stratifizierte Aufteilung nach Kategorien
- Ausgewogene Verteilung von Qualitätsstufen
- Repräsentative Abdeckung aller Datenquellen

**Validierungsdaten (15%):**
- Datensatz für die Modelloptimierung während des Trainings
- Unabhängig vom Trainingsdatensatz
- Ähnliche Verteilung wie Trainingsdaten
- Verwendung für Hyperparameter-Tuning

**Testdaten (15%):**
- Separater Datensatz für die finale Evaluierung
- Strikt getrennt von Trainings- und Validierungsdaten
- Repräsentativ für reale Anwendungsfälle
- Enthält spezielle Testfälle für Herausforderungen

### 3. Datenaugmentierung

**Textvariation:**
- Synonymersetzung für Schlüsselwörter
- Umformulierung von Sätzen
- Variation der Satzreihenfolge
- Einfügen oder Entfernen von Details

**Rauschhinzufügung:**
- Simulation von Tippfehlern
- Variation der Formalität und des Schreibstils
- Einfügen von Füllwörtern oder Redundanzen
- Variation der Textlänge

**Domänenspezifische Augmentierung:**
- Austausch von Fachbegriffen durch Synonyme
- Variation der Detailtiefe bei Vorschlägen
- Umformulierung von Forderungen in verschiedenen Tonalitäten
- Kombination von Elementen verschiedener Vorschläge

## Spezielle Datensätze

### 1. Evaluierungsdatensatz für Kategorisierung

**Zusammensetzung:**
- 200 sorgfältig ausgewählte Vorschläge
- Gleichmäßige Verteilung über alle Hauptkategorien
- Enthält Beispiele für Mehrfachkategorisierung
- Enthält Grenzfälle zwischen ähnlichen Kategorien

**Annotation:**
- Vollständige Annotation durch mindestens drei Experten
- Konsensbasierte "Gold-Standard"-Kategorisierung
- Detaillierte Begründungen für Kategoriezuordnungen
- Dokumentation von Diskussionspunkten bei Uneinigkeit

**Verwendung:**
- Benchmark für Kategorisierungsleistung
- Identifikation von Schwachstellen des Modells
- Vergleich verschiedener Modellversionen
- Regelmäßige Evaluierung nach Modellaktualisierungen

### 2. Qualitätsbewertungs-Referenzdatensatz

**Zusammensetzung:**
- 100 Vorschläge mit verschiedenen Qualitätsstufen
- Systematische Variation von Qualitätsdimensionen
- Beispiele für besonders gute und schlechte Vorschläge
- Grenzfälle für verschiedene Qualitätskriterien

**Annotation:**
- Detaillierte Qualitätsbewertung durch Expertenteam
- Ausführliche Begründungen für jede Bewertungsdimension
- Konsensbasierte Referenzbewertungen
- Dokumentation von Qualitätsmerkmalen und -mängeln

**Verwendung:**
- Kalibrierung des Qualitätsbewertungsmodells
- Evaluation der Übereinstimmung mit Expertenbewertungen
- Identifikation von Verbesserungspotenzial
- Demonstration der Modellleistung für Stakeholder

### 3. Duplikat- und Ähnlichkeitsdatensatz

**Zusammensetzung:**
- 50 Gruppen ähnlicher Vorschläge (je 2-5 Vorschläge)
- Verschiedene Grade der Ähnlichkeit innerhalb jeder Gruppe
- Beispiele für wörtliche und inhaltliche Duplikate
- Thematisch ähnliche, aber inhaltlich unterschiedliche Vorschläge

**Annotation:**
- Paarweise Ähnlichkeitsbewertungen für alle Kombinationen
- Klassifikation in Duplikate und Nicht-Duplikate
- Begründungen für Ähnlichkeitsurteile
- Identifikation der spezifischen Ähnlichkeitsmerkmale

**Verwendung:**
- Training und Evaluation des Ähnlichkeitsmodells
- Optimierung der Schwellenwerte für Duplikaterkennung
- Benchmark für Clustering-Algorithmen
- Demonstration der Duplikaterkennung

## Datenverwaltung und -dokumentation

### 1. Datenbank-Schema

**Haupttabellen:**
- Vorschläge (ID, Text, Metadaten, Quelle)
- Kategorisierungen (Vorschlags-ID, Kategorie-ID, Konfidenz, Annotator)
- Qualitätsbewertungen (Vorschlags-ID, Dimension, Wert, Annotator)
- Ähnlichkeitsbeziehungen (Vorschlags-ID-1, Vorschlags-ID-2, Ähnlichkeitswert, Typ)
- Annotatoren (ID, Rolle, Expertise)

**Metadaten:**
- Annotationshistorie und -versionen
- Qualitätsmetriken (Inter-Annotator-Agreement)
- Verwendungsstatus (Training, Validierung, Test)
- Datensatzstatistiken

### 2. Datendokumentation

**Datensatzbeschreibung:**
- Detaillierte Beschreibung aller Datenquellen
- Statistiken zur Verteilung von Kategorien und Eigenschaften
- Dokumentation des Annotationsprozesses
- Bekannte Einschränkungen und Verzerrungen

**Annotationsrichtlinien:**
- Vollständige Dokumentation aller Annotationsrichtlinien
- Entscheidungsbäume und Beispiele
- Protokolle für Konfliktlösung
- Qualitätssicherungsmaßnahmen

**Versionierung:**
- Klare Versionierung aller Datensätze
- Changelog für Änderungen und Erweiterungen
- Nachverfolgbarkeit von Datenmodifikationen
- Archivierung früherer Versionen

### 3. Datenschutz und Ethik

**Anonymisierung:**
- Protokoll für die Entfernung persönlicher Informationen
- Verifizierung der Anonymisierung durch mehrere Prüfer
- Dokumentation der Anonymisierungsmethoden
- Regelmäßige Überprüfung auf Reidentifikationsrisiken

**Ethische Richtlinien:**
- Sicherstellung der Diversität und Repräsentativität
- Vermeidung von Verzerrungen in den Trainingsdaten
- Transparente Dokumentation von Einschränkungen
- Regelmäßige ethische Überprüfung des Datensatzes

**Rechtliche Aspekte:**
- Dokumentation der Rechtsgrundlage für die Datennutzung
- Einhaltung der DSGVO und anderer relevanter Vorschriften
- Klare Nutzungsbedingungen und -beschränkungen
- Protokollierung von Datenzugriffen

## Implementierungsplan

### 1. Initiale Datensammlung (Monat 1-2)

- Erstellung von 500 simulierten Vorschlägen durch Projektteam
- Beschaffung von 300-500 öffentlichen Petitionen und Bürgereingaben
- Entwicklung detaillierter Annotationsrichtlinien
- Aufbau der Dateninfrastruktur und Annotationstools

### 2. Erste Annotationsphase (Monat 2-3)

- Annotation der initialen Daten durch Projektteam
- Berechnung von Inter-Annotator-Agreement
- Verfeinerung der Annotationsrichtlinien
- Erstellung des ersten Trainingsdatensatzes (v0.1)

### 3. Modellprototyp und Datenaugmentierung (Monat 3-4)

- Training eines ersten Modellprototyps
- Identifikation von Schwachstellen und Datenlücken
- Gezielte Erstellung weiterer Beispiele für unterrepräsentierte Kategorien
- Datenaugmentierung für robusteres Training

### 4. Skalierung und Qualitätssicherung (Monat 4-6)

- Erweiterung auf vollständigen Datensatzumfang
- Einbeziehung externer Annotatoren für Skalierung
- Strenge Qualitätskontrolle durch Expertenüberprüfung
- Erstellung spezieller Evaluierungsdatensätze

### 5. Kontinuierliche Verbesserung (ab Monat 6)

- Regelmäßige Erweiterung mit neuen realen Vorschlägen
- Gezielte Ergänzung basierend auf Modellschwächen
- Aktualisierung der Datensätze bei Änderungen der Kategoriestruktur
- Dokumentation aller Änderungen und Versionen

## Erfolgskriterien für Trainingsdaten

- **Umfang**: Mindestens 3.500 annotierte Vorschläge für initiales Training
- **Diversität**: Abdeckung aller Kategorien mit mindestens 100 Beispielen pro Kategorie
- **Qualität**: Inter-Annotator-Agreement von mindestens 0,8 (Cohen's Kappa)
- **Repräsentativität**: Ausgewogene Verteilung verschiedener Schreibstile und Komplexitätsgrade
- **Dokumentation**: Vollständige und transparente Dokumentation aller Datenquellen und Prozesse
- **Ethik**: Nachweis der Einhaltung ethischer Richtlinien und Datenschutzbestimmungen

## Zusammenfassung

Die definierten Trainingsdaten bilden eine solide Grundlage für die Entwicklung eines leistungsfähigen KI-Modells zur Verarbeitung von Bürgervorschlägen. Durch die Kombination verschiedener Datenquellen, sorgfältige Annotation und umfassende Qualitätssicherung wird sichergestellt, dass das Modell die vielfältigen Anforderungen des Bürgerbeteiligungssystems erfüllen kann. Der strukturierte Implementierungsplan ermöglicht eine schrittweise Entwicklung und kontinuierliche Verbesserung der Datenbasis.
