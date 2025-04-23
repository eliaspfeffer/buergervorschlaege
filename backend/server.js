const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Erstellen der Express-App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulierte Datenbank
const db = {
  proposals: [
    {
      id: '1',
      title: 'Ausbau von Fahrradwegen in der Innenstadt',
      content: 'Ich schlage vor, das Fahrradwegenetz in der Innenstadt auszubauen, um den Verkehr umweltfreundlicher zu gestalten und die Luftqualität zu verbessern. Konkret sollten auf allen Hauptstraßen separate Fahrradspuren eingerichtet werden, die durch physische Barrieren vom Autoverkehr getrennt sind.',
      category: 'Verkehr',
      secondary_categories: ['Umwelt', 'Stadtplanung'],
      status: 'submitted',
      ministry: 'Verkehrsministerium',
      created_at: '2025-03-15T10:30:00Z',
      votes: 42,
      user: {
        id: 'user1',
        name: 'Max Mustermann'
      },
      tags: ['Fahrrad', 'Verkehr', 'Umwelt', 'Innenstadt'],
      ai_analysis: {
        quality: 0.85,
        relevance: 0.9,
        feasibility: 0.8
      }
    },
    {
      id: '2',
      title: 'Digitalisierung der Schulbildung',
      content: 'Um die Bildungsqualität zu verbessern, schlage ich vor, alle Schulen mit modernen digitalen Geräten auszustatten und Lehrer entsprechend fortzubilden. Jeder Schüler sollte Zugang zu einem Tablet oder Laptop haben, und digitale Lernplattformen sollten in den Unterricht integriert werden.',
      category: 'Bildung',
      secondary_categories: ['Digitalisierung'],
      status: 'processing',
      ministry: 'Bildungsministerium',
      created_at: '2025-03-10T14:15:00Z',
      votes: 38,
      user: {
        id: 'user2',
        name: 'Anna Schmidt'
      },
      tags: ['Bildung', 'Digitalisierung', 'Schule', 'Zukunft'],
      ai_analysis: {
        quality: 0.8,
        relevance: 0.85,
        feasibility: 0.7
      }
    },
    {
      id: '3',
      title: 'Förderung erneuerbarer Energien in Privathaushalten',
      content: 'Ich schlage vor, die Installation von Solaranlagen und anderen erneuerbaren Energiequellen in Privathaushalten stärker zu fördern. Dies könnte durch direkte finanzielle Zuschüsse, Steuererleichterungen und vereinfachte Genehmigungsverfahren geschehen.',
      category: 'Umwelt',
      secondary_categories: ['Energie', 'Wirtschaft'],
      status: 'answered',
      ministry: 'Umweltministerium',
      created_at: '2025-03-05T09:45:00Z',
      votes: 65,
      user: {
        id: 'user3',
        name: 'Laura Weber'
      },
      tags: ['Erneuerbare Energie', 'Solar', 'Klimaschutz', 'Förderung'],
      ai_analysis: {
        quality: 0.9,
        relevance: 0.95,
        feasibility: 0.75
      }
    },
    {
      id: '4',
      title: 'Verbesserung des öffentlichen Nahverkehrs',
      content: 'Der öffentliche Nahverkehr sollte durch häufigere Verbindungen und modernere Fahrzeuge verbessert werden. Dies würde die Attraktivität steigern und mehr Menschen zum Umstieg vom Auto bewegen.',
      category: 'Verkehr',
      secondary_categories: ['Umwelt'],
      status: 'submitted',
      ministry: 'Verkehrsministerium',
      created_at: '2025-03-20T16:20:00Z',
      votes: 29,
      user: {
        id: 'user4',
        name: 'Thomas Becker'
      },
      tags: ['ÖPNV', 'Verkehr', 'Umwelt', 'Mobilität'],
      ai_analysis: {
        quality: 0.75,
        relevance: 0.8,
        feasibility: 0.7
      }
    },
    {
      id: '5',
      title: 'Mehr Grünflächen in der Stadt',
      content: 'Ich schlage vor, mehr Grünflächen und Parks in der Stadt zu schaffen, um die Lebensqualität zu verbessern und die Luftqualität zu erhöhen. Besonders in dicht bebauten Vierteln sollten kleine Pocket-Parks angelegt werden.',
      category: 'Stadtplanung',
      secondary_categories: ['Umwelt', 'Gesundheit'],
      status: 'processing',
      ministry: 'Umweltministerium',
      created_at: '2025-03-18T11:10:00Z',
      votes: 51,
      user: {
        id: 'user5',
        name: 'Sophie Müller'
      },
      tags: ['Grünflächen', 'Parks', 'Stadtplanung', 'Lebensqualität'],
      ai_analysis: {
        quality: 0.85,
        relevance: 0.9,
        feasibility: 0.8
      }
    }
  ],
  categories: [
    { id: '1', name: 'Verkehr', description: 'Themen rund um Verkehr und Mobilität' },
    { id: '2', name: 'Umwelt', description: 'Umweltschutz, Klimawandel und Nachhaltigkeit' },
    { id: '3', name: 'Bildung', description: 'Schulen, Universitäten und Bildungspolitik' },
    { id: '4', name: 'Gesundheit', description: 'Gesundheitswesen und öffentliche Gesundheit' },
    { id: '5', name: 'Stadtplanung', description: 'Stadtentwicklung und Infrastruktur' },
    { id: '6', name: 'Wirtschaft', description: 'Wirtschaftspolitik und Arbeitsmarkt' },
    { id: '7', name: 'Digitalisierung', description: 'Digitale Transformation und Technologie' },
    { id: '8', name: 'Energie', description: 'Energiepolitik und Versorgung' }
  ],
  ministries: [
    { id: '1', name: 'Verkehrsministerium', description: 'Zuständig für Verkehr und Infrastruktur' },
    { id: '2', name: 'Umweltministerium', description: 'Zuständig für Umweltschutz und Klimapolitik' },
    { id: '3', name: 'Bildungsministerium', description: 'Zuständig für Bildung und Forschung' },
    { id: '4', name: 'Gesundheitsministerium', description: 'Zuständig für Gesundheitswesen' },
    { id: '5', name: 'Wirtschaftsministerium', description: 'Zuständig für Wirtschaft und Energie' },
    { id: '6', name: 'Innenministerium', description: 'Zuständig für innere Sicherheit und Verwaltung' }
  ],
  users: [
    { id: 'user1', email: 'max@example.com', name: 'Max Mustermann', role: 'citizen' },
    { id: 'user2', email: 'anna@example.com', name: 'Anna Schmidt', role: 'citizen' },
    { id: 'user3', email: 'laura@example.com', name: 'Laura Weber', role: 'citizen' },
    { id: 'user4', email: 'thomas@example.com', name: 'Thomas Becker', role: 'citizen' },
    { id: 'user5', email: 'sophie@example.com', name: 'Sophie Müller', role: 'citizen' },
    { id: 'admin1', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
    { id: 'ministry1', email: 'verkehr@example.com', name: 'Verkehrsministerium', role: 'ministry' },
    { id: 'ministry2', email: 'umwelt@example.com', name: 'Umweltministerium', role: 'ministry' }
  ],
  comments: [
    { 
      id: '1', 
      proposal_id: '1', 
      user: { id: 'user2', name: 'Anna Schmidt' }, 
      content: 'Tolle Idee! In meinem Viertel fehlen auch sichere Fahrradwege.',
      created_at: '2025-03-16T08:45:00Z'
    },
    { 
      id: '2', 
      proposal_id: '1', 
      user: { id: 'user3', name: 'Laura Weber' }, 
      content: 'Ich würde mir auch mehr Fahrradstellplätze an wichtigen Knotenpunkten wünschen.',
      created_at: '2025-03-16T10:20:00Z'
    },
    { 
      id: '3', 
      proposal_id: '2', 
      user: { id: 'user1', name: 'Max Mustermann' }, 
      content: 'Wichtiges Thema! Die Digitalisierung der Bildung ist längst überfällig.',
      created_at: '2025-03-11T15:30:00Z'
    },
    { 
      id: '4', 
      proposal_id: '3', 
      user: { id: 'ministry2', name: 'Umweltministerium' }, 
      content: 'Vielen Dank für Ihren Vorschlag. Wir arbeiten bereits an einem Förderprogramm für erneuerbare Energien in Privathaushalten, das in den nächsten Monaten vorgestellt wird.',
      created_at: '2025-03-10T14:15:00Z',
      official: true
    }
  ],
  statistics: {
    total_proposals: 5,
    proposals_by_status: {
      submitted: 2,
      processing: 2,
      answered: 1,
      completed: 0,
      rejected: 0
    },
    proposals_by_category: [
      { category: 'Verkehr', count: 2 },
      { category: 'Umwelt', count: 1 },
      { category: 'Bildung', count: 1 },
      { category: 'Stadtplanung', count: 1 }
    ],
    proposals_by_ministry: [
      { ministry: 'Verkehrsministerium', count: 2 },
      { ministry: 'Umweltministerium', count: 2 },
      { ministry: 'Bildungsministerium', count: 1 }
    ],
    average_processing_time: 14.5,
    implementation_rate: 0.65
  }
};

// API-Endpunkte

// Status
app.get('/api/v1/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Vorschläge abrufen
app.get('/api/v1/proposals', (req, res) => {
  const { category, status, ministry, search, page = 1, limit = 10 } = req.query;
  
  let filteredProposals = [...db.proposals];
  
  // Filtern
  if (category) {
    filteredProposals = filteredProposals.filter(p => 
      p.category === category || p.secondary_categories.includes(category)
    );
  }
  
  if (status) {
    filteredProposals = filteredProposals.filter(p => p.status === status);
  }
  
  if (ministry) {
    filteredProposals = filteredProposals.filter(p => p.ministry === ministry);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProposals = filteredProposals.filter(p => 
      p.title.toLowerCase().includes(searchLower) || 
      p.content.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Paginierung
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProposals = filteredProposals.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    count: filteredProposals.length,
    total_pages: Math.ceil(filteredProposals.length / limit),
    current_page: parseInt(page),
    proposals: paginatedProposals
  });
});

// Einzelnen Vorschlag abrufen
app.get('/api/v1/proposals/:id', (req, res) => {
  const proposal = db.proposals.find(p => p.id === req.params.id);
  
  if (!proposal) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Vorschlag nicht gefunden'
      }
    });
  }
  
  // Kommentare zum Vorschlag abrufen
  const comments = db.comments.filter(c => c.proposal_id === proposal.id);
  
  // Vollständigen Vorschlag mit Kommentaren zurückgeben
  res.json({
    success: true,
    proposal: {
      ...proposal,
      comments
    }
  });
});

// Kategorien abrufen
app.get('/api/v1/categories', (req, res) => {
  res.json({
    success: true,
    categories: db.categories
  });
});

// Ministerien abrufen
app.get('/api/v1/ministries', (req, res) => {
  res.json({
    success: true,
    ministries: db.ministries
  });
});

// Statistiken abrufen
app.get('/api/v1/statistics', (req, res) => {
  res.json({
    success: true,
    statistics: db.statistics
  });
});

// Neuen Vorschlag einreichen
app.post('/api/v1/proposals', (req, res) => {
  const { title, content, category, tags } = req.body;
  
  // Validierung
  if (!title || !content || !category) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Titel, Inhalt und Kategorie sind erforderlich'
      }
    });
  }
  
  // Neuen Vorschlag erstellen
  const newProposal = {
    id: (db.proposals.length + 1).toString(),
    title,
    content,
    category,
    secondary_categories: [],
    status: 'submitted',
    ministry: db.ministries.find(m => Math.random() > 0.5)?.name || 'Noch nicht zugeordnet',
    created_at: new Date().toISOString(),
    votes: 0,
    user: {
      id: 'user1',
      name: 'Max Mustermann'
    },
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    ai_analysis: {
      quality: Math.random() * 0.3 + 0.7,
      relevance: Math.random() * 0.3 + 0.7,
      feasibility: Math.random() * 0.3 + 0.7
    }
  };
  
  // Vorschlag zur Datenbank hinzufügen
  db.proposals.push(newProposal);
  
  // Statistiken aktualisieren
  db.statistics.total_proposals++;
  db.statistics.proposals_by_status.submitted++;
  
  res.status(201).json({
    success: true,
    proposal: newProposal
  });
});

// Für einen Vorschlag abstimmen
app.post('/api/v1/proposals/:id/vote', (req, res) => {
  const proposal = db.proposals.find(p => p.id === req.params.id);
  
  if (!proposal) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Vorschlag nicht gefunden'
      }
    });
  }
  
  // Stimme hinzufügen
  proposal.votes++;
  
  res.json({
    success: true,
    votes: proposal.votes
  });
});

// Kommentar zu einem Vorschlag hinzufügen
app.post('/api/v1/proposals/:id/comment', (req, res) => {
  const { content } = req.body;
  const proposal = db.proposals.find(p => p.id === req.params.id);
  
  if (!proposal) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Vorschlag nicht gefunden'
      }
    });
  }
  
  if (!content) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Kommentarinhalt ist erforderlich'
      }
    });
  }
  
  // Neuen Kommentar erstellen
  const newComment = {
    id: (db.comments.length + 1).toString(),
    proposal_id: proposal.id,
    user: {
      id: 'user1',
      name: 'Max Mustermann'
    },
    content,
    created_at: new Date().toISOString()
  };
  
  // Kommentar zur Datenbank hinzufügen
  db.comments.push(newComment);
  
  res.status(201).json({
    success: true,
    comment: newComment
  });
});

// Fallback für alle anderen Routen - Frontend ausliefern
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
