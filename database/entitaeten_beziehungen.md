# Entitäten und Beziehungen für das Bürgerbeteiligungssystem

## Hauptentitäten

### 1. Benutzer (User)
Repräsentiert alle Systembenutzer, einschließlich Bürger und Ministeriumsmitarbeiter.

**Attribute:**
- ID (Primärschlüssel)
- E-Mail (eindeutig)
- Passwort-Hash
- Vorname
- Nachname
- Registrierungsdatum
- Letzter Login
- Benutzertyp (Bürger, Ministeriumsmitarbeiter, Administrator)
- Status (aktiv, inaktiv, gesperrt)
- Profilbild (optional)
- Kontaktinformationen (optional)
- Datenschutzeinstellungen
- Benachrichtigungseinstellungen

### 2. Vorschlag (Proposal)
Repräsentiert einen von einem Bürger eingereichten Vorschlag.

**Attribute:**
- ID (Primärschlüssel)
- Titel
- Inhalt
- Erstellungsdatum
- Letztes Aktualisierungsdatum
- Status (eingereicht, in Bearbeitung, kategorisiert, an Ministerium weitergeleitet, beantwortet, abgeschlossen, abgelehnt)
- Anonymisiert (Boolean)
- Sichtbarkeit (öffentlich, privat)
- Quellinformationen (optional)
- Anhänge (Referenzen zu Dateien)
- Benutzer-ID (Fremdschlüssel, kann null sein bei anonymen Vorschlägen)
- KI-Bewertung
- Priorität

### 3. Kategorie (Category)
Repräsentiert Themenbereiche für die Kategorisierung von Vorschlägen.

**Attribute:**
- ID (Primärschlüssel)
- Name
- Beschreibung
- Übergeordnete Kategorie (Fremdschlüssel, selbstreferenzierend, optional)
- Aktiv (Boolean)
- Erstellungsdatum
- Icon/Bild (optional)

### 4. Ministerium (Ministry)
Repräsentiert ein Ministerium oder eine Behörde, die Vorschläge bearbeitet.

**Attribute:**
- ID (Primärschlüssel)
- Name
- Beschreibung
- Kontaktinformationen
- Zuständigkeitsbereiche
- Logo/Bild
- Website-URL
- Aktiv (Boolean)

### 5. Kommentar (Comment)
Repräsentiert Kommentare zu Vorschlägen von Bürgern oder Ministeriumsmitarbeitern.

**Attribute:**
- ID (Primärschlüssel)
- Inhalt
- Erstellungsdatum
- Letztes Aktualisierungsdatum
- Benutzer-ID (Fremdschlüssel)
- Vorschlag-ID (Fremdschlüssel)
- Übergeordneter Kommentar (Fremdschlüssel, selbstreferenzierend, optional)
- Sichtbarkeit (öffentlich, nur Ministerium, nur Vorschlagsersteller)
- Offiziell (Boolean, für Ministeriumsantworten)

### 6. Anhang (Attachment)
Repräsentiert Dateien, die an Vorschläge angehängt werden können.

**Attribute:**
- ID (Primärschlüssel)
- Dateiname
- Dateipfad/URL
- Dateityp
- Dateigröße
- Hochladedatum
- Benutzer-ID (Fremdschlüssel)
- Vorschlag-ID (Fremdschlüssel)
- Beschreibung (optional)

### 7. Bewertung (Rating)
Repräsentiert Bewertungen von Vorschlägen durch Bürger.

**Attribute:**
- ID (Primärschlüssel)
- Wert (z.B. 1-5 oder positiv/negativ)
- Erstellungsdatum
- Benutzer-ID (Fremdschlüssel)
- Vorschlag-ID (Fremdschlüssel)
- Kommentar (optional)

### 8. Benachrichtigung (Notification)
Repräsentiert Benachrichtigungen für Benutzer.

**Attribute:**
- ID (Primärschlüssel)
- Typ (Statusänderung, Kommentar, Antwort, System)
- Inhalt
- Erstellungsdatum
- Gelesen (Boolean)
- Benutzer-ID (Fremdschlüssel)
- Referenz-ID (z.B. Vorschlag-ID oder Kommentar-ID)
- Referenz-Typ (Vorschlag, Kommentar, etc.)

### 9. KI-Analyse (AIAnalysis)
Repräsentiert die KI-Analyse eines Vorschlags.

**Attribute:**
- ID (Primärschlüssel)
- Vorschlag-ID (Fremdschlüssel)
- Analysedatum
- Qualitätsbewertung
- Relevanz
- Umsetzbarkeit
- Sentiment-Analyse
- Schlüsselwörter
- Ähnliche Vorschläge (JSON-Array von Vorschlag-IDs)
- Verarbeitungszeit
- Modellversion
- Rohdaten (JSON)

### 10. Rolle (Role)
Repräsentiert Benutzerrollen für die Zugriffssteuerung.

**Attribute:**
- ID (Primärschlüssel)
- Name
- Beschreibung
- Berechtigungen (JSON-Array)
- Erstellungsdatum
- Aktiv (Boolean)

## Beziehungstabellen

### 1. Benutzer-Rolle (UserRole)
Verknüpft Benutzer mit Rollen (Many-to-Many).

**Attribute:**
- Benutzer-ID (Fremdschlüssel)
- Rolle-ID (Fremdschlüssel)
- Zuweisungsdatum
- Zugewiesen von (Benutzer-ID, Fremdschlüssel)

### 2. Vorschlag-Kategorie (ProposalCategory)
Verknüpft Vorschläge mit Kategorien (Many-to-Many).

**Attribute:**
- Vorschlag-ID (Fremdschlüssel)
- Kategorie-ID (Fremdschlüssel)
- Zuweisungsdatum
- Zuweisungstyp (manuell, KI)
- Konfidenz (für KI-Zuweisungen)

### 3. Vorschlag-Ministerium (ProposalMinistry)
Verknüpft Vorschläge mit Ministerien (Many-to-Many).

**Attribute:**
- Vorschlag-ID (Fremdschlüssel)
- Ministerium-ID (Fremdschlüssel)
- Zuweisungsdatum
- Status (zugewiesen, in Bearbeitung, beantwortet, abgeschlossen)
- Priorität innerhalb des Ministeriums
- Zuständiger Mitarbeiter (Benutzer-ID, Fremdschlüssel, optional)

### 4. Ministerium-Kategorie (MinistryCategory)
Verknüpft Ministerien mit ihren Zuständigkeitskategorien (Many-to-Many).

**Attribute:**
- Ministerium-ID (Fremdschlüssel)
- Kategorie-ID (Fremdschlüssel)
- Zuweisungsdatum
- Priorität

### 5. Benutzer-Ministerium (UserMinistry)
Verknüpft Ministeriumsmitarbeiter mit ihren Ministerien (Many-to-Many).

**Attribute:**
- Benutzer-ID (Fremdschlüssel)
- Ministerium-ID (Fremdschlüssel)
- Position/Titel
- Abteilung
- Startdatum
- Enddatum (optional)
- Aktiv (Boolean)

## Zusätzliche Entitäten für erweiterte Funktionen

### 1. Tag (Tag)
Repräsentiert Schlagwörter für Vorschläge.

**Attribute:**
- ID (Primärschlüssel)
- Name
- Beschreibung (optional)
- Erstellungsdatum
- Häufigkeit (Anzahl der Verwendungen)

### 2. Vorschlag-Tag (ProposalTag)
Verknüpft Vorschläge mit Tags (Many-to-Many).

**Attribute:**
- Vorschlag-ID (Fremdschlüssel)
- Tag-ID (Fremdschlüssel)
- Zuweisungsdatum
- Zuweisungstyp (manuell, KI)
- Konfidenz (für KI-Zuweisungen)

### 3. Audit-Log (AuditLog)
Protokolliert wichtige Systemaktivitäten für Sicherheit und Compliance.

**Attribute:**
- ID (Primärschlüssel)
- Ereignistyp
- Beschreibung
- Zeitstempel
- Benutzer-ID (Fremdschlüssel, optional)
- IP-Adresse
- Betroffene Entität (z.B. Vorschlag, Benutzer)
- Entitäts-ID
- Alte Werte (JSON, optional)
- Neue Werte (JSON, optional)

### 4. Feedback (Feedback)
Repräsentiert Feedback zur KI-Kategorisierung.

**Attribute:**
- ID (Primärschlüssel)
- Vorschlag-ID (Fremdschlüssel)
- Benutzer-ID (Fremdschlüssel)
- Feedback-Typ (korrekt, inkorrekt)
- Kommentar (optional)
- Erstellungsdatum
- Korrekturvorschlag (JSON, optional)

### 5. Statistik (Statistic)
Speichert aggregierte Statistiken für Reporting und Dashboards.

**Attribute:**
- ID (Primärschlüssel)
- Statistiktyp (Vorschläge pro Tag, Kategorieverteilung, etc.)
- Zeitraum (täglich, wöchentlich, monatlich)
- Startdatum
- Enddatum
- Werte (JSON)
- Erstellungsdatum
- Aktualisierungsdatum

## Beziehungsdiagramm (ER-Diagramm)

```
User 1---* Proposal
User 1---* Comment
User 1---* Attachment
User 1---* Rating
User 1---* Notification
User *---* Role (via UserRole)
User *---* Ministry (via UserMinistry)

Proposal 1---* Comment
Proposal 1---* Attachment
Proposal 1---* Rating
Proposal 1---1 AIAnalysis
Proposal *---* Category (via ProposalCategory)
Proposal *---* Ministry (via ProposalMinistry)
Proposal *---* Tag (via ProposalTag)

Comment *---1 Comment (self-referencing)

Category *---1 Category (self-referencing)
Category *---* Ministry (via MinistryCategory)

Ministry *---* Category (via MinistryCategory)
Ministry *---* Proposal (via ProposalMinistry)
Ministry *---* User (via UserMinistry)

Notification *---1 User

AIAnalysis *---1 Proposal

Role *---* User (via UserRole)

Tag *---* Proposal (via ProposalTag)

Feedback *---1 Proposal
Feedback *---1 User
```

Dieses Entitäten-Beziehungs-Modell bildet die Grundlage für das Datenbankschema des Bürgerbeteiligungssystems und deckt alle in der Anforderungsanalyse identifizierten Funktionen ab.
