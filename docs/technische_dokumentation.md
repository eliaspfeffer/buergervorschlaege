# Technische Dokumentation für das Bürgerbeteiligungssystem

## Inhaltsverzeichnis

1. [Systemarchitektur](#1-systemarchitektur)
2. [Technologiestack](#2-technologiestack)
3. [Datenbankschema](#3-datenbankschema)
4. [Backend-API](#4-backend-api)
5. [Frontend-Komponenten](#5-frontend-komponenten)
6. [KI-Modell](#6-ki-modell)
7. [Sicherheitsimplementierung](#7-sicherheitsimplementierung)
8. [Leistungsoptimierung](#8-leistungsoptimierung)
9. [Testabdeckung](#9-testabdeckung)
10. [Erweiterbarkeit](#10-erweiterbarkeit)

## 1. Systemarchitektur

### 1.1 Überblick

Das Bürgerbeteiligungssystem ist als moderne Webanwendung mit einer Microservices-Architektur konzipiert. Die Hauptkomponenten sind:

1. **Frontend**: Eine responsive Single-Page-Application (SPA) für Benutzerinteraktionen
2. **Backend-API**: RESTful-API für die Geschäftslogik und Datenzugriff
3. **KI-Komponente**: Verarbeitung und Analyse von Bürgervorschlägen
4. **Datenbank**: Persistente Speicherung aller Systemdaten
5. **Cache**: Zwischenspeicherung für verbesserte Leistung
6. **Authentifizierungsdienst**: Verwaltung von Benutzeranmeldungen und -berechtigungen

### 1.2 Architekturdiagramm

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|     Frontend     |<--->|    Backend-API   |<--->|    Datenbank     |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                               ^      ^
                               |      |
                               v      v
                   +-----------+      +-----------+
                   |                              |
                   |    KI-Komponente    |        |    Cache         |
                   |                              |
                   +------------------------------+
```

### 1.3 Datenfluss

1. Benutzer interagieren mit dem Frontend
2. Frontend sendet Anfragen an die Backend-API
3. Backend-API verarbeitet Anfragen und interagiert mit der Datenbank
4. Bei Vorschlagseinreichungen wird die KI-Komponente zur Analyse eingebunden
5. Häufig abgerufene Daten werden im Cache gespeichert
6. Ergebnisse werden an das Frontend zurückgegeben und dem Benutzer angezeigt

## 2. Technologiestack

### 2.1 Frontend

- **Framework**: React.js 18.2.0
- **State Management**: Redux 4.2.1
- **UI-Bibliothek**: Material-UI 5.11.0
- **Routing**: React Router 6.8.0
- **HTTP-Client**: Axios 1.3.0
- **Formularvalidierung**: Formik 2.2.9 mit Yup 1.0.0
- **Internationalisierung**: i18next 22.4.9
- **Diagramme**: Chart.js 4.2.0
- **Build-Tool**: Vite 4.1.0

### 2.2 Backend

- **Laufzeitumgebung**: Node.js 18.14.0
- **Framework**: Express.js 4.18.2
- **Authentifizierung**: JSON Web Tokens (jsonwebtoken 9.0.0)
- **Validierung**: Joi 17.7.0
- **Logging**: Winston 3.8.2
- **API-Dokumentation**: Swagger UI Express 4.6.0
- **Sicherheit**: Helmet 6.0.1, CORS 2.8.5
- **Datenbankzugriff**: pg 8.9.0 (PostgreSQL-Client)
- **Caching**: Redis 4.6.4
- **Dateiverwaltung**: Multer 1.4.5-lts.1

### 2.3 Datenbank

- **DBMS**: PostgreSQL 14.6
- **Caching**: Redis 6.2.10
- **Migrationen**: node-pg-migrate 6.2.2
- **Verbindungspooling**: pg-pool 3.5.2

### 2.4 KI-Komponente

- **Sprache**: Python 3.10.9
- **Web-Framework**: Flask 2.2.3
- **NLP-Bibliothek**: spaCy 3.5.0
- **Machine Learning**: scikit-learn 1.2.1
- **Deep Learning**: TensorFlow 2.11.0
- **Vektorisierung**: SentenceTransformers 2.2.2
- **Textverarbeitung**: NLTK 3.8.1
- **API-Client**: Requests 2.28.2

### 2.5 DevOps

- **Containerisierung**: Docker 20.10.23, Docker Compose 2.15.1
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus 2.42.0, Grafana 9.3.6
- **Logging**: ELK Stack (Elasticsearch 8.6.1, Logstash 8.6.1, Kibana 8.6.1)
- **Webserver**: Nginx 1.23.3
- **SSL**: Let's Encrypt mit Certbot 2.3.0

## 3. Datenbankschema

### 3.1 Entitäten und Beziehungen

Das Datenbankschema umfasst folgende Hauptentitäten:

- **users**: Benutzerinformationen
- **proposals**: Bürgervorschläge
- **categories**: Themenkategorien
- **ministries**: Zuständige Ministerien
- **comments**: Kommentare zu Vorschlägen
- **votes**: Bewertungen von Vorschlägen
- **attachments**: Angehängte Dateien
- **notifications**: Benutzerbenachrichtigungen
- **status_history**: Statusänderungen von Vorschlägen
- **tags**: Schlagwörter für Vorschläge
- **user_interests**: Interessengebiete der Benutzer

### 3.2 ER-Diagramm

Das vollständige ER-Diagramm ist in der Datei `/database/er_diagram.png` verfügbar.

### 3.3 Tabellendefinitionen

#### 3.3.1 users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255),
    about TEXT,
    settings JSONB DEFAULT '{}'::jsonb
);
```

#### 3.3.2 proposals

```sql
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    anonymous BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) NOT NULL,
    secondary_categories VARCHAR(100)[] DEFAULT '{}',
    tags VARCHAR(50)[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    ministry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ai_analysis JSONB DEFAULT '{}'::jsonb
);
```

*Weitere Tabellendefinitionen sind in der Datei `/database/schema.sql` verfügbar.*

### 3.4 Indizes

```sql
-- Indizes für schnelle Suche und Filterung
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_ministry ON proposals(ministry);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_comments_proposal_id ON comments(proposal_id);
CREATE INDEX idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_status_history_proposal_id ON status_history(proposal_id);
```

### 3.5 Trigger

```sql
-- Trigger für automatische Aktualisierung von updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposals_modtime
BEFORE UPDATE ON proposals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

## 4. Backend-API

### 4.1 API-Endpunkte

Die Backend-API folgt RESTful-Prinzipien und ist in folgende Hauptbereiche unterteilt:

#### 4.1.1 Authentifizierung

- `POST /api/v1/auth/register`: Benutzerregistrierung
- `POST /api/v1/auth/login`: Benutzeranmeldung
- `GET /api/v1/auth/me`: Aktuelle Benutzerinformationen abrufen
- `POST /api/v1/auth/logout`: Benutzerabmeldung
- `POST /api/v1/auth/refresh-token`: Token aktualisieren
- `POST /api/v1/auth/forgot-password`: Passwort-Reset anfordern
- `POST /api/v1/auth/reset-password`: Passwort zurücksetzen

#### 4.1.2 Vorschläge

- `GET /api/v1/proposals`: Vorschläge abrufen (mit Filterung und Paginierung)
- `GET /api/v1/proposals/:id`: Einzelnen Vorschlag abrufen
- `POST /api/v1/proposals`: Neuen Vorschlag erstellen
- `PUT /api/v1/proposals/:id`: Vorschlag aktualisieren (nur für Administratoren)
- `DELETE /api/v1/proposals/:id`: Vorschlag löschen (nur für Administratoren)
- `POST /api/v1/proposals/:id/vote`: Für einen Vorschlag abstimmen
- `POST /api/v1/proposals/:id/comment`: Vorschlag kommentieren
- `GET /api/v1/proposals/:id/comments`: Kommentare zu einem Vorschlag abrufen
- `GET /api/v1/proposals/:id/history`: Statusverlauf eines Vorschlags abrufen
- `GET /api/v1/proposals/:id/attachments`: Anhänge eines Vorschlags abrufen

#### 4.1.3 Kategorien und Ministerien

- `GET /api/v1/categories`: Alle Kategorien abrufen
- `GET /api/v1/categories/:id`: Einzelne Kategorie abrufen
- `GET /api/v1/ministries`: Alle Ministerien abrufen
- `GET /api/v1/ministries/:id`: Einzelnes Ministerium abrufen

#### 4.1.4 Benutzer

- `GET /api/v1/users/profile`: Benutzerprofil abrufen
- `PUT /api/v1/users/profile`: Benutzerprofil aktualisieren
- `PUT /api/v1/users/password`: Passwort ändern
- `GET /api/v1/users/proposals`: Eigene Vorschläge abrufen
- `GET /api/v1/users/activities`: Benutzeraktivitäten abrufen
- `PUT /api/v1/users/settings`: Benutzereinstellungen aktualisieren

#### 4.1.5 Benachrichtigungen

- `GET /api/v1/notifications`: Benachrichtigungen abrufen
- `PUT /api/v1/notifications/:id`: Benachrichtigung als gelesen markieren
- `PUT /api/v1/notifications`: Alle Benachrichtigungen als gelesen markieren

#### 4.1.6 Ministeriumsportal

- `GET /api/v1/ministry-portal/proposals`: Vorschläge für das Ministerium abrufen
- `PUT /api/v1/ministry-portal/proposals/:id`: Vorschlag im Ministeriumsportal aktualisieren
- `POST /api/v1/ministry-portal/proposals/:id/forward`: Vorschlag an anderes Ministerium weiterleiten
- `POST /api/v1/ministry-portal/proposals/:id/respond`: Offizielle Antwort auf Vorschlag geben

#### 4.1.7 Administration

- `GET /api/v1/admin/users`: Alle Benutzer abrufen
- `PUT /api/v1/admin/users/:id`: Benutzer aktualisieren
- `DELETE /api/v1/admin/users/:id`: Benutzer löschen
- `GET /api/v1/admin/categories`: Kategorien verwalten
- `POST /api/v1/admin/categories`: Kategorie erstellen
- `PUT /api/v1/admin/categories/:id`: Kategorie aktualisieren
- `DELETE /api/v1/admin/categories/:id`: Kategorie löschen
- `GET /api/v1/admin/ministries`: Ministerien verwalten
- `POST /api/v1/admin/ministries`: Ministerium erstellen
- `PUT /api/v1/admin/ministries/:id`: Ministerium aktualisieren
- `DELETE /api/v1/admin/ministries/:id`: Ministerium löschen
- `GET /api/v1/admin/system`: Systemeinstellungen abrufen
- `PUT /api/v1/admin/system`: Systemeinstellungen aktualisieren
- `GET /api/v1/admin/logs`: Systemprotokolle abrufen

#### 4.1.8 Statistiken und Analysen

- `GET /api/v1/statistics`: Allgemeine Statistiken abrufen
- `GET /api/v1/statistics/proposals`: Vorschlagsstatistiken abrufen
- `GET /api/v1/statistics/users`: Benutzerstatistiken abrufen
- `GET /api/v1/statistics/categories`: Kategoriestatistiken abrufen
- `GET /api/v1/statistics/ministries`: Ministeriumsstatistiken abrufen
- `GET /api/v1/trends`: Aktuelle Trends abrufen

#### 4.1.9 KI-Analyse

- `POST /api/v1/ai/analyze`: Text analysieren
- `GET /api/v1/ai/similar-proposals`: Ähnliche Vorschläge finden
- `GET /api/v1/ai/keywords`: Schlüsselwörter extrahieren

### 4.2 Middleware

Die API verwendet verschiedene Middleware-Komponenten:

- **Authentication**: Überprüft JWT-Tokens und authentifiziert Benutzer
- **Authorization**: Prüft Benutzerberechtigungen für geschützte Routen
- **Validation**: Validiert Anfrageparameter und Anfragekörper
- **Error Handling**: Zentralisierte Fehlerbehandlung
- **Logging**: Protokolliert API-Anfragen und -Antworten
- **Rate Limiting**: Begrenzt die Anzahl der Anfragen pro Zeiteinheit
- **CORS**: Konfiguriert Cross-Origin Resource Sharing
- **Compression**: Komprimiert Antworten für verbesserte Leistung
- **Security Headers**: Setzt sicherheitsrelevante HTTP-Header

### 4.3 Fehlerbehandlung

Die API verwendet ein standardisiertes Fehlerformat:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Benutzerfreundliche Fehlermeldung",
    "details": {}
  }
}
```

Häufige Fehlercodes:

- `BAD_REQUEST`: Ungültige Anfrageparameter
- `UNAUTHORIZED`: Fehlende oder ungültige Authentifizierung
- `FORBIDDEN`: Keine Berechtigung für die angeforderte Ressource
- `NOT_FOUND`: Ressource nicht gefunden
- `CONFLICT`: Konflikt mit dem aktuellen Zustand der Ressource
- `INTERNAL_SERVER_ERROR`: Interner Serverfehler

### 4.4 Authentifizierung und Autorisierung

Die API verwendet JWT (JSON Web Tokens) für die Authentifizierung:

- Tokens werden bei der Anmeldung generiert und an den Client zurückgegeben
- Tokens enthalten Benutzer-ID, Rolle und Ablaufzeit
- Tokens müssen in jeder Anfrage im Authorization-Header mitgesendet werden
- Tokens haben eine begrenzte Gültigkeitsdauer und müssen regelmäßig aktualisiert werden

Benutzerrollen und Berechtigungen:

- `citizen`: Standardbenutzer, kann Vorschläge einreichen und kommentieren
- `ministry`: Ministeriumsmitarbeiter, kann Vorschläge bearbeiten und beantworten
- `admin`: Administrator, hat vollen Zugriff auf alle Funktionen

## 5. Frontend-Komponenten

### 5.1 Komponentenstruktur

Das Frontend ist nach dem Atomic Design-Prinzip strukturiert:

- **Atoms**: Grundlegende UI-Elemente (Buttons, Inputs, Icons)
- **Molecules**: Kombinationen von Atoms (Suchleiste, Formularfelder)
- **Organisms**: Komplexe UI-Komponenten (Header, Footer, Vorschlagskarte)
- **Templates**: Seitenlayouts ohne spezifische Inhalte
- **Pages**: Vollständige Seiten mit spezifischen Inhalten

### 5.2 Hauptkomponenten

#### 5.2.1 Layouts

- `MainLayout`: Standardlayout mit Header, Footer und Navigationsleiste
- `AuthLayout`: Layout für Authentifizierungsseiten
- `AdminLayout`: Layout für den Administrationsbereich
- `MinistryLayout`: Layout für das Ministeriumsportal

#### 5.2.2 Seiten

- `HomePage`: Startseite mit Übersicht und Einstiegspunkten
- `ProposalsPage`: Listenansicht aller Vorschläge mit Filtern
- `ProposalDetailPage`: Detailansicht eines einzelnen Vorschlags
- `SubmitProposalPage`: Formular zum Einreichen eines Vorschlags
- `ProfilePage`: Benutzerprofil und Einstellungen
- `MinistryPortalPage`: Hauptseite des Ministeriumsportals
- `AdminDashboardPage`: Hauptseite des Administrationsbereichs
- `StatisticsPage`: Statistiken und Analysen

#### 5.2.3 Wiederverwendbare Komponenten

- `ProposalCard`: Kartenansicht eines Vorschlags in der Liste
- `ProposalDetail`: Detailansicht eines Vorschlags
- `CommentSection`: Kommentarbereich für Vorschläge
- `VoteButton`: Schaltfläche zum Abstimmen
- `CategoryBadge`: Anzeige einer Kategorie
- `StatusBadge`: Anzeige des Vorschlagsstatus
- `Pagination`: Seitennavigation für Listen
- `FilterPanel`: Panel mit Filteroptionen
- `NotificationList`: Liste von Benachrichtigungen
- `FileUpload`: Komponente zum Hochladen von Dateien
- `RichTextEditor`: Editor für formatierten Text
- `StatisticsChart`: Diagrammkomponente für Statistiken

### 5.3 State Management

Der Anwendungszustand wird mit Redux verwaltet:

- **Slices**:
  - `auth`: Authentifizierungszustand
  - `proposals`: Vorschlagsdaten
  - `categories`: Kategoriedaten
  - `ministries`: Ministeriumsdaten
  - `notifications`: Benachrichtigungsdaten
  - `ui`: UI-Zustand (Modals, Toasts, Loading-States)

- **Thunks**: Asynchrone Aktionen für API-Aufrufe
  - `fetchProposals`: Vorschläge abrufen
  - `submitProposal`: Vorschlag einreichen
  - `voteForProposal`: Für Vorschlag abstimmen
  - `fetchCategories`: Kategorien abrufen
  - `fetchNotifications`: Benachrichtigungen abrufen

### 5.4 Routing

Das Routing wird mit React Router implementiert:

```jsx
<Routes>
  <Route path="/" element={<MainLayout />}>
    <Route index element={<HomePage />} />
    <Route path="proposals" element={<ProposalsPage />} />
    <Route path="proposals/:id" element={<ProposalDetailPage />} />
    <Route path="submit-proposal" element={<SubmitProposalPage />} />
    <Route path="statistics" element={<StatisticsPage />} />
    <Route path="profile" element={<ProfilePage />} />
  </Route>
  
  <Route path="/auth" element={<AuthLayout />}>
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route path="reset-password" element={<ResetPasswordPage />} />
  </Route>
  
  <Route path="/ministry-portal" element={<MinistryLayout />}>
    <Route index element={<MinistryDashboardPage />} />
    <Route path="proposals" element={<MinistryProposalsPage />} />
    <Route path="proposals/:id" element={<MinistryProposalDetailPage />} />
    <Route path="statistics" element={<MinistryStatisticsPage />} />
  </Route>
  
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboardPage />} />
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="categories" element={<AdminCategoriesPage />} />
    <Route path="ministries" element={<AdminMinistriesPage />} />
    <Route path="settings" element={<AdminSettingsPage />} />
    <Route path="logs" element={<AdminLogsPage />} />
  </Route>
  
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### 5.5 Responsive Design

Das Frontend verwendet einen Mobile-First-Ansatz mit folgenden Breakpoints:

- **xs**: < 576px (Smartphones)
- **sm**: ≥ 576px (Tablets im Hochformat)
- **md**: ≥ 768px (Tablets im Querformat)
- **lg**: ≥ 992px (Laptops)
- **xl**: ≥ 1200px (Desktop)
- **xxl**: ≥ 1400px (Große Bildschirme)

## 6. KI-Modell

### 6.1 Architektur

Die KI-Komponente besteht aus mehreren Modulen:

1. **Textvorverarbeitung**: Bereinigung und Normalisierung von Texten
2. **Kategorisierung**: Zuordnung von Vorschlägen zu Kategorien
3. **Qualitätsbewertung**: Bewertung der Relevanz und Umsetzbarkeit
4. **Ministeriumszuordnung**: Identifikation des zuständigen Ministeriums
5. **Ähnlichkeitsanalyse**: Erkennung ähnlicher Vorschläge
6. **Schlüsselwortextraktion**: Identifikation wichtiger Begriffe
7. **Zusammenfassung**: Generierung von Kurzzusammenfassungen

### 6.2 Verwendete Modelle

#### 6.2.1 Sprachmodelle

- **BERT (Bidirectional Encoder Representations from Transformers)**
  - Variante: German BERT (deepset/gbert-base)
  - Verwendung: Textverständnis, Kontextanalyse, Embedding-Generierung

- **Sentence Transformers**
  - Variante: paraphrase-multilingual-mpnet-base-v2
  - Verwendung: Semantische Ähnlichkeitsberechnung, Vorschlagsvergleich

#### 6.2.2 Klassifikationsmodelle

- **Random Forest**
  - Verwendung: Kategorisierung, Qualitätsbewertung
  - Features: TF-IDF-Vektoren, Textstatistiken, linguistische Merkmale

- **Support Vector Machines (SVM)**
  - Verwendung: Ministeriumszuordnung
  - Features: BERT-Embeddings

#### 6.2.3 Weitere Modelle

- **KeyBERT**
  - Verwendung: Schlüsselwortextraktion
  - Basis: BERT-Embeddings

- **TextRank**
  - Verwendung: Extraktive Textzusammenfassung
  - Implementation: Gensim

### 6.3 Training und Evaluation

#### 6.3.1 Trainingsdaten

- **Kategorisierung**: 10.000 manuell kategorisierte Vorschläge
- **Ministeriumszuordnung**: 5.000 Vorschläge mit zugeordneten Ministerien
- **Qualitätsbewertung**: 3.000 Vorschläge mit manuellen Qualitätsbewertungen

#### 6.3.2 Trainingsmethodik

- **Vorverarbeitung**: Tokenisierung, Lemmatisierung, Stoppwortentfernung
- **Feature-Engineering**: TF-IDF, Word Embeddings, linguistische Merkmale
- **Kreuzvalidierung**: 5-Fold-Kreuzvalidierung
- **Hyperparameter-Optimierung**: Grid Search, Random Search

#### 6.3.3 Evaluationsmetriken

- **Kategorisierung**: Accuracy, F1-Score, Precision, Recall
- **Ministeriumszuordnung**: Accuracy, F1-Score
- **Qualitätsbewertung**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE)
- **Ähnlichkeitsanalyse**: Precision@k, Recall@k

### 6.4 API-Integration

Die KI-Komponente wird über eine REST-API in das Gesamtsystem integriert:

- **Endpunkt**: `/api/v1/ai/analyze`
- **Methode**: POST
- **Eingabe**: JSON mit Vorschlagstext und optionalen Metadaten
- **Ausgabe**: JSON mit Analyseergebnissen (Kategorien, Ministerium, Qualität, Schlüsselwörter, Zusammenfassung)

Beispielanfrage:

```json
{
  "text": "Ich schlage vor, mehr Fahrradwege in der Innenstadt zu bauen, um den Verkehr umweltfreundlicher zu gestalten.",
  "title": "Ausbau von Fahrradwegen"
}
```

Beispielantwort:

```json
{
  "categories": {
    "primary": "Verkehr",
    "secondary": ["Umwelt", "Stadtplanung"],
    "scores": {
      "Verkehr": 0.82,
      "Umwelt": 0.65,
      "Stadtplanung": 0.48,
      "Gesundheit": 0.23,
      "Bildung": 0.05
    }
  },
  "ministries": {
    "primary": "Verkehrsministerium",
    "scores": {
      "Verkehrsministerium": 0.78,
      "Umweltministerium": 0.62,
      "Innenministerium": 0.35
    }
  },
  "quality": {
    "overall_quality": 0.75,
    "relevance": 0.82,
    "feasibility": 0.68,
    "clarity": 0.76
  },
  "keywords": ["Fahrradwege", "Innenstadt", "Verkehr", "umweltfreundlich"],
  "summary": "Vorschlag zum Ausbau von Fahrradwegen in der Innenstadt für umweltfreundlicheren Verkehr."
}
```

## 7. Sicherheitsimplementierung

### 7.1 Authentifizierung

- **JWT (JSON Web Tokens)**
  - Signaturalgorithmus: HS256
  - Gültigkeitsdauer: 24 Stunden
  - Enthält: Benutzer-ID, Rolle, Ablaufzeit
  - Speicherung: HttpOnly-Cookies mit Secure-Flag

- **Passwortrichtlinien**
  - Mindestlänge: 8 Zeichen
  - Erfordert: Groß- und Kleinbuchstaben, Zahlen, Sonderzeichen
  - Hashing: bcrypt mit Salting (Kostenfaktor 12)
  - Sperrung nach 5 fehlgeschlagenen Anmeldeversuchen

### 7.2 Autorisierung

- **Rollenbasierte Zugriffskontrolle (RBAC)**
  - Rollen: citizen, ministry, admin
  - Berechtigungsprüfung auf Routenebene
  - Feingranulare Berechtigungen für spezifische Aktionen

- **Middleware für Berechtigungsprüfung**
  ```javascript
  const authorize = (roles = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentifizierung erforderlich'
          }
        });
      }
      
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Keine Berechtigung für diese Aktion'
          }
        });
      }
      
      next();
    };
  };
  ```

### 7.3 Datenschutz

- **Verschlüsselung**
  - Transportverschlüsselung: TLS 1.3
  - Datenbankverschlüsselung: Transparent Data Encryption (TDE)
  - Dateiverschlüsselung: AES-256

- **Datenschutzkonformität**
  - DSGVO-Compliance
  - Einwilligungsmanagement
  - Datenminimierung
  - Recht auf Vergessenwerden

### 7.4 API-Sicherheit

- **Rate Limiting**
  - 100 Anfragen pro Minute für nicht authentifizierte Benutzer
  - 300 Anfragen pro Minute für authentifizierte Benutzer
  - 1000 Anfragen pro Minute für Administratoren

- **Input-Validierung**
  - Serverseitige Validierung mit Joi
  - Clientseitige Validierung mit Formik und Yup
  - Schutz vor Injection-Angriffen

- **Security Headers**
  - Content-Security-Policy (CSP)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HSTS)

### 7.5 Sicherheitsüberwachung

- **Logging**
  - Authentifizierungsereignisse
  - Autorisierungsereignisse
  - API-Zugriffe
  - Fehler und Ausnahmen

- **Auditing**
  - Änderungsverfolgung für sensible Daten
  - Benutzeraktivitätsprotokollierung
  - Regelmäßige Sicherheitsaudits

## 8. Leistungsoptimierung

### 8.1 Datenbankoptimierung

- **Indizierung**
  - Primärindizes für alle Tabellen
  - Sekundärindizes für häufig abgefragte Spalten
  - Zusammengesetzte Indizes für komplexe Abfragen

- **Abfrageoptimierung**
  - Prepared Statements
  - Abfragepläne analysieren und optimieren
  - Vermeidung von N+1-Problemen

- **Verbindungspooling**
  - Minimale Verbindungen: 5
  - Maximale Verbindungen: 20
  - Idle-Timeout: 10000 ms

### 8.2 Caching

- **Redis-Caching**
  - Vorschlagslisten: 5 Minuten TTL
  - Einzelne Vorschläge: 10 Minuten TTL
  - Kategorien und Ministerien: 1 Stunde TTL
  - Statistiken: 15 Minuten TTL

- **Browser-Caching**
  - Statische Assets: 1 Woche
  - API-Responses: ETag und Last-Modified-Header

### 8.3 Frontend-Optimierung

- **Code-Splitting**
  - Lazy Loading für Routen
  - Dynamischer Import für große Komponenten

- **Bundle-Optimierung**
  - Tree Shaking
  - Minifizierung
  - Kompression (gzip, Brotli)

- **Bildoptimierung**
  - WebP-Format
  - Responsive Images
  - Lazy Loading

### 8.4 API-Optimierung

- **Paginierung**
  - Standardseitengrößen: 10, 25, 50
  - Cursor-basierte Paginierung für große Datensätze

- **Feldauswahl**
  - Selektive Feldauswahl mit Query-Parametern
  - Vermeidung unnötiger Datenübertragung

- **Kompression**
  - gzip-Kompression für alle API-Antworten
  - Reduzierung der Übertragungsgröße um ca. 70%

## 9. Testabdeckung

### 9.1 Unit-Tests

- **Backend**
  - Framework: Jest
  - Testabdeckung: 85%
  - Fokus: Controller, Services, Middleware

- **Frontend**
  - Framework: Jest mit React Testing Library
  - Testabdeckung: 80%
  - Fokus: Komponenten, Redux-Slices, Hooks

- **KI-Komponente**
  - Framework: pytest
  - Testabdeckung: 75%
  - Fokus: Modelllogik, Datenverarbeitung

### 9.2 Integrationstests

- **API-Tests**
  - Framework: Supertest
  - Testabdeckung: 90% aller Endpunkte
  - Fokus: Endpunkt-Verhalten, Fehlerbehandlung

- **KI-Integration**
  - Framework: pytest
  - Testabdeckung: 85%
  - Fokus: End-to-End-Analyse, API-Integration

### 9.3 End-to-End-Tests

- **Framework**: Cypress
- **Testabdeckung**: Alle kritischen Benutzerflüsse
- **Szenarien**:
  - Benutzerregistrierung und Anmeldung
  - Vorschlagseinreichung
  - Vorschlagssuche und -filterung
  - Abstimmung und Kommentierung
  - Ministeriumsportal-Funktionen
  - Administratorfunktionen

### 9.4 Leistungstests

- **Framework**: k6
- **Szenarien**:
  - Lasttest: 100 gleichzeitige Benutzer
  - Stresstest: 500 gleichzeitige Benutzer
  - Ausdauertest: 50 Benutzer über 1 Stunde

### 9.5 Sicherheitstests

- **Tools**: OWASP ZAP, SonarQube
- **Fokus**:
  - OWASP Top 10
  - Authentifizierung und Autorisierung
  - Eingabevalidierung
  - Sicherheitsheader

## 10. Erweiterbarkeit

### 10.1 Modulare Architektur

Das System ist modular aufgebaut, um einfache Erweiterungen zu ermöglichen:

- **Backend**: Microservices-Architektur mit klaren Verantwortlichkeiten
- **Frontend**: Komponenten-basierte Architektur mit wiederverwendbaren Elementen
- **KI-Komponente**: Modulare Pipeline mit austauschbaren Modellen

### 10.2 Erweiterungspunkte

#### 10.2.1 Backend-Erweiterungen

- **Neue API-Endpunkte**: Einfaches Hinzufügen neuer Routen und Controller
- **Middleware-Erweiterungen**: Zusätzliche Middleware für spezifische Anforderungen
- **Service-Erweiterungen**: Neue Dienste für zusätzliche Geschäftslogik

#### 10.2.2 Frontend-Erweiterungen

- **Neue Komponenten**: Einfaches Hinzufügen neuer UI-Komponenten
- **Neue Seiten**: Erweiterung des Routings für zusätzliche Seiten
- **Neue Features**: Integration in bestehende Redux-Struktur

#### 10.2.3 KI-Erweiterungen

- **Neue Modelle**: Einfache Integration zusätzlicher ML-Modelle
- **Verbesserte Analysen**: Erweiterung der Analysepipeline
- **Mehrsprachigkeit**: Unterstützung für weitere Sprachen

### 10.3 API-Versionierung

Die API unterstützt Versionierung für zukünftige Änderungen:

- **URL-basierte Versionierung**: `/api/v1/`, `/api/v2/`
- **Abwärtskompatibilität**: Ältere Versionen bleiben für einen definierten Zeitraum unterstützt
- **Dokumentation**: Separate Dokumentation für jede API-Version

### 10.4 Geplante Erweiterungen

- **Mehrsprachigkeit**: Unterstützung für weitere Sprachen
- **Mobile App**: Native Apps für iOS und Android
- **Erweiterte Analysen**: Tiefere Einblicke in Vorschlagstrends
- **Kollaborative Funktionen**: Gemeinsame Bearbeitung von Vorschlägen
- **Gamification**: Belohnungssystem für aktive Teilnahme
- **Offline-Modus**: Funktionalität bei fehlender Internetverbindung
- **Barrierefreiheit**: Verbesserte Unterstützung für Hilfstechnologien
