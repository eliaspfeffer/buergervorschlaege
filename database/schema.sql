-- Datenbankschema für das KI-gestützte Bürgerbeteiligungssystem
-- PostgreSQL-Syntax

-- Erweiterungen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabellen

-- Benutzer (User)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('citizen', 'ministry_staff', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    profile_image VARCHAR(255),
    contact_info JSONB,
    privacy_settings JSONB NOT NULL DEFAULT '{}',
    notification_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Rolle (Role)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Benutzer-Rolle (UserRole)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Ministerium (Ministry)
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    contact_info JSONB,
    responsibilities TEXT[],
    logo_image VARCHAR(255),
    website_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Benutzer-Ministerium (UserMinistry)
CREATE TABLE user_ministries (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
    position VARCHAR(255),
    department VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ministry_id)
);

-- Kategorie (Category)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    icon_image VARCHAR(255),
    UNIQUE (name, parent_id)
);

-- Ministerium-Kategorie (MinistryCategory)
CREATE TABLE ministry_categories (
    ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    priority INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (ministry_id, category_id)
);

-- Vorschlag (Proposal)
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'processing', 'categorized', 'forwarded', 'answered', 'completed', 'rejected')),
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    source_info TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_rating DECIMAL(3,2),
    priority INTEGER NOT NULL DEFAULT 0
);

-- KI-Analyse (AIAnalysis)
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    analysis_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quality_score DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    feasibility_score DECIMAL(3,2),
    sentiment_analysis JSONB,
    keywords TEXT[],
    similar_proposals UUID[],
    processing_time INTEGER, -- in milliseconds
    model_version VARCHAR(100),
    raw_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vorschlag-Kategorie (ProposalCategory)
CREATE TABLE proposal_categories (
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assignment_type VARCHAR(20) NOT NULL DEFAULT 'ai' CHECK (assignment_type IN ('manual', 'ai')),
    confidence DECIMAL(3,2),
    PRIMARY KEY (proposal_id, category_id)
);

-- Vorschlag-Ministerium (ProposalMinistry)
CREATE TABLE proposal_ministries (
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    ministry_id UUID NOT NULL REFERENCES ministries(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned' 
        CHECK (status IN ('assigned', 'processing', 'answered', 'completed')),
    priority INTEGER NOT NULL DEFAULT 0,
    assigned_staff_id UUID REFERENCES users(id),
    PRIMARY KEY (proposal_id, ministry_id)
);

-- Anhang (Attachment)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL, -- in bytes
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Kommentar (Comment)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    visibility VARCHAR(30) NOT NULL DEFAULT 'public' 
        CHECK (visibility IN ('public', 'ministry_only', 'proposer_only')),
    is_official BOOLEAN NOT NULL DEFAULT FALSE
);

-- Bewertung (Rating)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    comment TEXT,
    UNIQUE (user_id, proposal_id)
);

-- Benachrichtigung (Notification)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('status_change', 'comment', 'reply', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reference_id UUID,
    reference_type VARCHAR(50)
);

-- Tag (Tag)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    frequency INTEGER NOT NULL DEFAULT 0
);

-- Vorschlag-Tag (ProposalTag)
CREATE TABLE proposal_tags (
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assignment_type VARCHAR(20) NOT NULL DEFAULT 'ai' CHECK (assignment_type IN ('manual', 'ai')),
    confidence DECIMAL(3,2),
    PRIMARY KEY (proposal_id, tag_id)
);

-- Feedback (Feedback)
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('correct', 'incorrect')),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    correction_suggestion JSONB
);

-- Audit-Log (AuditLog)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB
);

-- Statistik (Statistic)
CREATE TABLE statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statistic_type VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    values JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indizes

-- Benutzer
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);

-- Vorschläge
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_proposals_visibility ON proposals(visibility);
CREATE INDEX idx_proposals_priority ON proposals(priority);

-- Kommentare
CREATE INDEX idx_comments_proposal_id ON comments(proposal_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- Kategorien
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Anhänge
CREATE INDEX idx_attachments_proposal_id ON attachments(proposal_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);

-- Bewertungen
CREATE INDEX idx_ratings_proposal_id ON ratings(proposal_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Benachrichtigungen
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- KI-Analyse
CREATE INDEX idx_ai_analyses_proposal_id ON ai_analyses(proposal_id);
CREATE INDEX idx_ai_analyses_analysis_date ON ai_analyses(analysis_date);

-- Audit-Log
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Statistik
CREATE INDEX idx_statistics_period_type ON statistics(period_type);
CREATE INDEX idx_statistics_date_range ON statistics(start_date, end_date);

-- Trigger-Funktionen

-- Aktualisierung des updated_at-Zeitstempels
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON ministries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ministries_updated_at BEFORE UPDATE ON user_ministries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON ai_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aktualisierung der Tag-Häufigkeit
CREATE OR REPLACE FUNCTION update_tag_frequency()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET frequency = frequency + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET frequency = frequency - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_frequency_insert AFTER INSERT ON proposal_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_frequency();

CREATE TRIGGER update_tag_frequency_delete AFTER DELETE ON proposal_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_frequency();

-- Standarddaten

-- Standardrollen
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Systemadministrator mit vollen Rechten', '["all"]'),
('ministry_manager', 'Ministeriumsleiter mit Verwaltungsrechten für ein Ministerium', '["ministry_manage", "proposal_manage", "staff_manage"]'),
('ministry_staff', 'Ministeriumsmitarbeiter mit Bearbeitungsrechten für Vorschläge', '["proposal_view", "proposal_process", "comment_official"]'),
('citizen', 'Bürger mit Rechten zum Einreichen von Vorschlägen', '["proposal_submit", "proposal_view_own", "comment_own"]');

-- Standardkategorien (Beispiele)
INSERT INTO categories (name, description) VALUES
('Bildung', 'Vorschläge zum Bildungssystem, Schulen und Universitäten'),
('Umwelt', 'Vorschläge zu Umweltschutz, Klimawandel und Nachhaltigkeit'),
('Verkehr', 'Vorschläge zu Verkehrsinfrastruktur, öffentlichem Nahverkehr und Mobilität'),
('Gesundheit', 'Vorschläge zum Gesundheitssystem, medizinischer Versorgung und Prävention'),
('Wirtschaft', 'Vorschläge zu Wirtschaftsförderung, Arbeitsmarkt und Unternehmen'),
('Digitalisierung', 'Vorschläge zur digitalen Transformation, E-Government und IT-Infrastruktur'),
('Soziales', 'Vorschläge zu sozialer Sicherung, Integration und Gleichstellung'),
('Kultur', 'Vorschläge zu Kunst, Kultur und kulturellem Erbe'),
('Sicherheit', 'Vorschläge zu innerer Sicherheit, Polizei und Katastrophenschutz'),
('Finanzen', 'Vorschläge zu Steuern, Haushalt und Finanzpolitik');

-- Beispielministerien
INSERT INTO ministries (name, description, responsibilities, website_url) VALUES
('Bundesministerium für Bildung und Forschung', 'Zuständig für Bildungspolitik und Forschungsförderung', ARRAY['Bildungspolitik', 'Forschungsförderung', 'Hochschulen'], 'https://www.bmbf.de/'),
('Bundesministerium für Umwelt, Naturschutz und nukleare Sicherheit', 'Zuständig für Umweltschutz und Klimapolitik', ARRAY['Umweltschutz', 'Klimapolitik', 'Naturschutz'], 'https://www.bmu.de/'),
('Bundesministerium für Verkehr und digitale Infrastruktur', 'Zuständig für Verkehrspolitik und digitale Infrastruktur', ARRAY['Verkehrspolitik', 'Digitale Infrastruktur', 'Mobilität'], 'https://www.bmvi.de/'),
('Bundesministerium für Gesundheit', 'Zuständig für Gesundheitspolitik und Gesundheitssystem', ARRAY['Gesundheitspolitik', 'Gesundheitssystem', 'Prävention'], 'https://www.bundesgesundheitsministerium.de/'),
('Bundesministerium für Wirtschaft und Energie', 'Zuständig für Wirtschaftspolitik und Energiepolitik', ARRAY['Wirtschaftspolitik', 'Energiepolitik', 'Mittelstand'], 'https://www.bmwi.de/');

-- Verknüpfung von Ministerien und Kategorien
INSERT INTO ministry_categories (ministry_id, category_id, priority) 
SELECT m.id, c.id, 1
FROM ministries m, categories c
WHERE 
    (m.name = 'Bundesministerium für Bildung und Forschung' AND c.name = 'Bildung') OR
    (m.name = 'Bundesministerium für Umwelt, Naturschutz und nukleare Sicherheit' AND c.name = 'Umwelt') OR
    (m.name = 'Bundesministerium für Verkehr und digitale Infrastruktur' AND c.name = 'Verkehr') OR
    (m.name = 'Bundesministerium für Verkehr und digitale Infrastruktur' AND c.name = 'Digitalisierung') OR
    (m.name = 'Bundesministerium für Gesundheit' AND c.name = 'Gesundheit') OR
    (m.name = 'Bundesministerium für Wirtschaft und Energie' AND c.name = 'Wirtschaft');

-- Beispiel-Tags
INSERT INTO tags (name, description) VALUES
('Schule', 'Vorschläge zum Schulsystem'),
('Universität', 'Vorschläge zu Hochschulen und Universitäten'),
('Klimaschutz', 'Vorschläge zum Klimaschutz'),
('Öffentlicher Nahverkehr', 'Vorschläge zum ÖPNV'),
('Digitale Verwaltung', 'Vorschläge zur Digitalisierung der Verwaltung'),
('Gesundheitsversorgung', 'Vorschläge zur medizinischen Versorgung'),
('Arbeitsmarkt', 'Vorschläge zum Arbeitsmarkt und Beschäftigung'),
('Steuern', 'Vorschläge zur Steuerpolitik'),
('Wohnungsbau', 'Vorschläge zum Wohnungsbau und Mietrecht'),
('Energiewende', 'Vorschläge zur Energiewende und erneuerbaren Energien');

-- Kommentare:
-- 1. Dieses Schema verwendet UUIDs als Primärschlüssel für bessere Skalierbarkeit und Sicherheit.
-- 2. JSONB-Datentypen werden für flexible Strukturen wie Benutzereinstellungen und KI-Analysedaten verwendet.
-- 3. Indizes sind für häufig abgefragte Spalten definiert, um die Abfrageleistung zu verbessern.
-- 4. Trigger aktualisieren automatisch Zeitstempel und Tag-Häufigkeiten.
-- 5. Standarddaten für Rollen, Kategorien, Ministerien und Tags sind enthalten.
-- 6. Fremdschlüsselbeziehungen stellen die referenzielle Integrität sicher.
-- 7. CHECK-Constraints validieren Eingabedaten für bestimmte Spalten.
