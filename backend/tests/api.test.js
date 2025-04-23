const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Mock der Datenbankverbindung
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    connect: jest.fn().mockReturnThis(),
    release: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock der UUID-Generierung
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock der JWT-Funktionen
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid-token') {
      return { id: 'user-id', email: 'test@example.com', role: 'citizen' };
    } else if (token === 'admin-token') {
      return { id: 'admin-id', email: 'admin@example.com', role: 'admin' };
    } else if (token === 'ministry-token') {
      return { id: 'ministry-id', email: 'ministry@example.com', role: 'ministry' };
    } else {
      throw new Error('Invalid token');
    }
  }),
}));

// Mock der bcrypt-Funktionen
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === 'correct-password');
  }),
}));

// Mock der KI-Analyse-Funktion
jest.mock('../ai/proposal_processor', () => ({
  analyzeProposal: jest.fn().mockResolvedValue({
    categories: {
      primary: 'Umwelt',
      secondary: ['Verkehr', 'Stadtplanung'],
      scores: { Umwelt: 0.8, Verkehr: 0.6, Stadtplanung: 0.5 }
    },
    quality: {
      overall_quality: 0.75,
      relevance: 0.8,
      feasibility: 0.7
    },
    ministries: {
      primary: 'Umweltministerium',
      scores: { Umweltministerium: 0.8, Verkehrsministerium: 0.6 }
    },
    keywords: ['Nachhaltigkeit', 'Klimaschutz', 'Verkehrsberuhigung'],
    summary: 'Ein Vorschlag zur Verbesserung der Umweltsituation durch Verkehrsberuhigung.'
  }),
}));

// Hilfsfunktionen für Tests
const mockAuthHeader = (token) => {
  return { Authorization: `Bearer ${token}` };
};

describe('Auth API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/v1/auth/register', () => {
    test('sollte einen neuen Benutzer registrieren', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }))
        .mockImplementationOnce(() => ({
          rows: [{
            id: 'test-uuid',
            email: 'test@example.com',
            name: 'Test User',
            role: 'citizen',
            created_at: new Date()
          }]
        }));
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('test-token');
      expect(response.body.user).toHaveProperty('id', 'test-uuid');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('role', 'citizen');
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer bereits existiert', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{ id: 'existing-user-id' }]
      }));
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error).toHaveProperty('message', 'Benutzer mit dieser E-Mail existiert bereits');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
    
    test('sollte einen Fehler zurückgeben, wenn erforderliche Felder fehlen', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // password fehlt
          name: 'Test User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      
      expect(pool.query).not.toHaveBeenCalled();
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    test('sollte einen Benutzer anmelden', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'user-id',
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Test User',
          role: 'citizen'
        }]
      })).mockImplementationOnce(() => ({ rowCount: 1 }));
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correct-password'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBe('test-token');
      expect(response.body.user).toHaveProperty('id', 'user-id');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('role', 'citizen');
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer nicht existiert', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Ungültige Anmeldeinformationen');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
    
    test('sollte einen Fehler zurückgeben, wenn das Passwort falsch ist', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'user-id',
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Test User',
          role: 'citizen'
        }]
      }));
      
      // Mock der Passwortüberprüfung
      bcrypt.compare.mockResolvedValueOnce(false);
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Ungültige Anmeldeinformationen');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    test('sollte Benutzerinformationen zurückgeben', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
          role: 'citizen',
          created_at: new Date()
        }]
      })).mockImplementationOnce(() => ({
        rows: [
          { category: 'Umwelt' },
          { category: 'Bildung' }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set(mockAuthHeader('valid-token'));
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'user-id');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('role', 'citizen');
      expect(response.body).toHaveProperty('interests');
      expect(response.body.interests).toEqual(['Umwelt', 'Bildung']);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set(mockAuthHeader('valid-token'));
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Benutzer nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn kein Token vorhanden ist', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Authentifizierung erforderlich');
      
      expect(pool.query).not.toHaveBeenCalled();
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Token ungültig ist', async () => {
      // Mock der JWT-Verifizierung
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set(mockAuthHeader('invalid-token'));
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      
      expect(pool.query).not.toHaveBeenCalled();
      expect(jwt.verify).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Proposals API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/proposals', () => {
    test('sollte eine Liste von Vorschlägen zurückgeben', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '10' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-1',
            title: 'Vorschlag 1',
            content: 'Inhalt des Vorschlags 1',
            anonymous: false,
            category: 'Umwelt',
            secondary_categories: ['Verkehr'],
            status: 'submitted',
            ministry: 'Umweltministerium',
            created_at: new Date(),
            updated_at: new Date(),
            votes: 5,
            user_id: 'user-1',
            user_name: 'User 1'
          },
          {
            id: 'proposal-2',
            title: 'Vorschlag 2',
            content: 'Inhalt des Vorschlags 2',
            anonymous: true,
            category: 'Bildung',
            secondary_categories: [],
            status: 'processing',
            ministry: 'Bildungsministerium',
            created_at: new Date(),
            updated_at: new Date(),
            votes: 10,
            user_id: 'user-2',
            user_name: 'User 2'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/proposals')
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count', 10);
      expect(response.body).toHaveProperty('total_pages');
      expect(response.body).toHaveProperty('current_page', 1);
      expect(response.body).toHaveProperty('proposals');
      expect(response.body.proposals).toHaveLength(2);
      
      // Überprüfen des ersten Vorschlags
      expect(response.body.proposals[0]).toHaveProperty('id', 'proposal-1');
      expect(response.body.proposals[0]).toHaveProperty('title', 'Vorschlag 1');
      expect(response.body.proposals[0]).toHaveProperty('content', 'Inhalt des Vorschlags 1');
      expect(response.body.proposals[0]).toHaveProperty('user');
      expect(response.body.proposals[0].user).toHaveProperty('id', 'user-1');
      expect(response.body.proposals[0].user).toHaveProperty('name', 'User 1');
      
      // Überprüfen des zweiten Vorschlags (anonym)
      expect(response.body.proposals[1]).toHaveProperty('id', 'proposal-2');
      expect(response.body.proposals[1]).toHaveProperty('anonymous', true);
      expect(response.body.proposals[1]).toHaveProperty('user', null);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
    
    test('sollte Filter korrekt anwenden', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '5' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-1',
            title: 'Umweltvorschlag',
            content: 'Inhalt des Umweltvorschlags',
            anonymous: false,
            category: 'Umwelt',
            secondary_categories: [],
            status: 'submitted',
            ministry: 'Umweltministerium',
            created_at: new Date(),
            updated_at: new Date(),
            votes: 5,
            user_id: 'user-1',
            user_name: 'User 1'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/proposals')
        .query({
          category: 'Umwelt',
          status: 'submitted',
          ministry: 'Umweltministerium',
          search: 'Umwelt'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count', 5);
      expect(response.body).toHaveProperty('proposals');
      expect(response.body.proposals).toHaveLength(1);
      expect(response.body.proposals[0]).toHaveProperty('category', 'Umwelt');
      expect(response.body.proposals[0]).toHaveProperty('status', 'submitted');
      expect(response.body.proposals[0]).toHaveProperty('ministry', 'Umweltministerium');
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      // Überprüfen, ob die Filter in der Query verwendet wurden
      expect(pool.query.mock.calls[0][0]).toContain('WHERE 1=1');
      expect(pool.query.mock.calls[0][0]).toContain('AND (p.category = $1 OR $1 = ANY(p.secondary_categories))');
      expect(pool.query.mock.calls[0][0]).toContain('AND p.status = $2');
      expect(pool.query.mock.calls[0][0]).toContain('AND p.ministry = $3');
      expect(pool.query.mock.calls[0][0]).toContain('AND (p.title ILIKE $4 OR p.content ILIKE $4 OR p.category ILIKE $4)');
    });
  });
  
  describe('GET /api/v1/proposals/:id', () => {
    test('sollte einen einzelnen Vorschlag zurückgeben', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'proposal-1',
          title: 'Vorschlag 1',
          content: 'Inhalt des Vorschlags 1',
          anonymous: false,
          category: 'Umwelt',
          secondary_categories: ['Verkehr'],
          tags: ['Nachhaltigkeit', 'Klimaschutz'],
          status: 'submitted',
          ministry: 'Umweltministerium',
          created_at: new Date(),
          updated_at: new Date(),
          votes: 5,
          ai_analysis: {
            quality: 0.8,
            relevance: 0.9,
            feasibility: 0.7
          },
          user_id: 'user-1',
          user_name: 'User 1'
        }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'attachment-1',
            filename: 'dokument.pdf',
            file_path: '/path/to/dokument.pdf',
            content_type: 'application/pdf'
          }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'comment-1',
            content: 'Ein Kommentar',
            created_at: new Date(),
            user_id: 'user-2',
            user_name: 'User 2',
            user_role: 'citizen'
          }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            status: 'submitted',
            timestamp: new Date(),
            comment: 'Vorschlag eingereicht'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/proposals/proposal-1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('proposal');
      
      const proposal = response.body.proposal;
      expect(proposal).toHaveProperty('id', 'proposal-1');
      expect(proposal).toHaveProperty('title', 'Vorschlag 1');
      expect(proposal).toHaveProperty('content', 'Inhalt des Vorschlags 1');
      expect(proposal).toHaveProperty('user');
      expect(proposal.user).toHaveProperty('id', 'user-1');
      expect(proposal.user).toHaveProperty('name', 'User 1');
      expect(proposal).toHaveProperty('category', 'Umwelt');
      expect(proposal).toHaveProperty('secondary_categories');
      expect(proposal.secondary_categories).toContain('Verkehr');
      expect(proposal).toHaveProperty('tags');
      expect(proposal.tags).toContain('Nachhaltigkeit');
      expect(proposal).toHaveProperty('status', 'submitted');
      expect(proposal).toHaveProperty('ministry', 'Umweltministerium');
      expect(proposal).toHaveProperty('votes', 5);
      expect(proposal).toHaveProperty('ai_analysis');
      expect(proposal.ai_analysis).toHaveProperty('quality', 0.8);
      
      // Überprüfen der Anhänge
      expect(proposal).toHaveProperty('attachments');
      expect(proposal.attachments).toHaveLength(1);
      expect(proposal.attachments[0]).toHaveProperty('id', 'attachment-1');
      expect(proposal.attachments[0]).toHaveProperty('filename', 'dokument.pdf');
      expect(proposal.attachments[0]).toHaveProperty('url', '/api/v1/attachments/attachment-1');
      
      // Überprüfen der Kommentare
      expect(proposal).toHaveProperty('comments');
      expect(proposal.comments).toHaveLength(1);
      expect(proposal.comments[0]).toHaveProperty('id', 'comment-1');
      expect(proposal.comments[0]).toHaveProperty('content', 'Ein Kommentar');
      expect(proposal.comments[0]).toHaveProperty('user');
      expect(proposal.comments[0].user).toHaveProperty('id', 'user-2');
      expect(proposal.comments[0].user).toHaveProperty('name', 'User 2');
      
      // Überprüfen des Statusverlaufs
      expect(proposal).toHaveProperty('status_history');
      expect(proposal.status_history).toHaveLength(1);
      expect(proposal.status_history[0]).toHaveProperty('status', 'submitted');
      expect(proposal.status_history[0]).toHaveProperty('comment', 'Vorschlag eingereicht');
      
      expect(pool.query).toHaveBeenCalledTimes(4);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Vorschlag nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .get('/api/v1/proposals/nonexistent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Vorschlag nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('POST /api/v1/proposals', () => {
    test('sollte einen neuen Vorschlag erstellen', async () => {
      // Mock der Datenbankabfragen
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce() // BEGIN
          .mockResolvedValueOnce({ // INSERT INTO proposals
            rows: [{
              id: 'test-uuid',
              title: 'Neuer Vorschlag',
              content: 'Inhalt des neuen Vorschlags',
              category: 'Umwelt',
              secondary_categories: ['Verkehr'],
              tags: ['Nachhaltigkeit'],
              status: 'submitted',
              ministry: 'Umweltministerium',
              created_at: new Date()
            }]
          })
          .mockResolvedValueOnce() // INSERT INTO status_history
          .mockResolvedValueOnce(), // COMMIT
        release: jest.fn()
      };
      
      pool.connect.mockResolvedValueOnce(mockClient);
      
      const response = await request(app)
        .post('/api/v1/proposals')
        .set(mockAuthHeader('valid-token'))
        .send({
          title: 'Neuer Vorschlag',
          content: 'Inhalt des neuen Vorschlags',
          category: 'Umwelt',
          tags: JSON.stringify(['Nachhaltigkeit']),
          anonymous: false
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('proposal');
      expect(response.body.proposal).toHaveProperty('id', 'test-uuid');
      expect(response.body.proposal).toHaveProperty('title', 'Neuer Vorschlag');
      expect(response.body.proposal).toHaveProperty('content', 'Inhalt des neuen Vorschlags');
      expect(response.body.proposal).toHaveProperty('category', 'Umwelt');
      expect(response.body.proposal).toHaveProperty('status', 'submitted');
      
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledTimes(4);
      expect(mockClient.release).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn erforderliche Felder fehlen', async () => {
      const response = await request(app)
        .post('/api/v1/proposals')
        .set(mockAuthHeader('valid-token'))
        .send({
          // title fehlt
          content: 'Inhalt des neuen Vorschlags',
          category: 'Umwelt'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error).toHaveProperty('message', 'Titel, Inhalt und Kategorie sind erforderlich');
      
      expect(pool.connect).not.toHaveBeenCalled();
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer nicht authentifiziert ist', async () => {
      const response = await request(app)
        .post('/api/v1/proposals')
        .send({
          title: 'Neuer Vorschlag',
          content: 'Inhalt des neuen Vorschlags',
          category: 'Umwelt'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Authentifizierung erforderlich');
      
      expect(pool.connect).not.toHaveBeenCalled();
    });
  });
});

describe('Categories API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/categories', () => {
    test('sollte eine Liste von Kategorien zurückgeben', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({
        rows: [
          {
            id: 'category-1',
            name: 'Umwelt',
            description: 'Umweltthemen',
            proposal_count: '15'
          },
          {
            id: 'category-2',
            name: 'Bildung',
            description: 'Bildungsthemen',
            proposal_count: '10'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/categories');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('categories');
      expect(response.body.categories).toHaveLength(2);
      
      expect(response.body.categories[0]).toHaveProperty('id', 'category-1');
      expect(response.body.categories[0]).toHaveProperty('name', 'Umwelt');
      expect(response.body.categories[0]).toHaveProperty('description', 'Umweltthemen');
      expect(response.body.categories[0]).toHaveProperty('proposal_count', '15');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('GET /api/v1/categories/:id', () => {
    test('sollte Details zu einer Kategorie zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'category-1',
          name: 'Umwelt',
          description: 'Umweltthemen'
        }]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '15' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'category-2',
            name: 'Verkehr'
          },
          {
            id: 'category-3',
            name: 'Stadtplanung'
          }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'ministry-1',
            name: 'Umweltministerium'
          },
          {
            id: 'ministry-2',
            name: 'Verkehrsministerium'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/categories/category-1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('category');
      
      const category = response.body.category;
      expect(category).toHaveProperty('id', 'category-1');
      expect(category).toHaveProperty('name', 'Umwelt');
      expect(category).toHaveProperty('description', 'Umweltthemen');
      expect(category).toHaveProperty('proposal_count', 15);
      
      // Überprüfen der verwandten Kategorien
      expect(category).toHaveProperty('related_categories');
      expect(category.related_categories).toHaveLength(2);
      expect(category.related_categories[0]).toHaveProperty('id', 'category-2');
      expect(category.related_categories[0]).toHaveProperty('name', 'Verkehr');
      
      // Überprüfen der Ministerien
      expect(category).toHaveProperty('ministries');
      expect(category.ministries).toHaveLength(2);
      expect(category.ministries[0]).toHaveProperty('id', 'ministry-1');
      expect(category.ministries[0]).toHaveProperty('name', 'Umweltministerium');
      
      expect(pool.query).toHaveBeenCalledTimes(4);
    });
    
    test('sollte einen Fehler zurückgeben, wenn die Kategorie nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .get('/api/v1/categories/nonexistent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Kategorie nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Ministries API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/ministries', () => {
    test('sollte eine Liste von Ministerien zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [
          {
            id: 'ministry-1',
            name: 'Umweltministerium',
            description: 'Zuständig für Umweltthemen',
            proposal_count: '15'
          },
          {
            id: 'ministry-2',
            name: 'Bildungsministerium',
            description: 'Zuständig für Bildungsthemen',
            proposal_count: '10'
          }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'category-1',
            name: 'Umwelt'
          },
          {
            id: 'category-2',
            name: 'Klimaschutz'
          }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'category-3',
            name: 'Bildung'
          },
          {
            id: 'category-4',
            name: 'Forschung'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/ministries');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('ministries');
      expect(response.body.ministries).toHaveLength(2);
      
      expect(response.body.ministries[0]).toHaveProperty('id', 'ministry-1');
      expect(response.body.ministries[0]).toHaveProperty('name', 'Umweltministerium');
      expect(response.body.ministries[0]).toHaveProperty('description', 'Zuständig für Umweltthemen');
      expect(response.body.ministries[0]).toHaveProperty('proposal_count', '15');
      expect(response.body.ministries[0]).toHaveProperty('categories');
      expect(response.body.ministries[0].categories).toHaveLength(2);
      expect(response.body.ministries[0].categories[0]).toHaveProperty('name', 'Umwelt');
      
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('GET /api/v1/ministries/:id', () => {
    test('sollte Details zu einem Ministerium zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'ministry-1',
          name: 'Umweltministerium',
          description: 'Zuständig für Umweltthemen',
          contact_info: {
            email: 'info@umweltministerium.de',
            phone: '+49 30 123456',
            website: 'https://umweltministerium.de'
          }
        }]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '15' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'category-1',
            name: 'Umwelt'
          },
          {
            id: 'category-2',
            name: 'Klimaschutz'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/ministries/ministry-1');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('ministry');
      
      const ministry = response.body.ministry;
      expect(ministry).toHaveProperty('id', 'ministry-1');
      expect(ministry).toHaveProperty('name', 'Umweltministerium');
      expect(ministry).toHaveProperty('description', 'Zuständig für Umweltthemen');
      expect(ministry).toHaveProperty('proposal_count', 15);
      expect(ministry).toHaveProperty('contact_info');
      expect(ministry.contact_info).toHaveProperty('email', 'info@umweltministerium.de');
      expect(ministry.contact_info).toHaveProperty('phone', '+49 30 123456');
      expect(ministry.contact_info).toHaveProperty('website', 'https://umweltministerium.de');
      
      // Überprüfen der Kategorien
      expect(ministry).toHaveProperty('categories');
      expect(ministry.categories).toHaveLength(2);
      expect(ministry.categories[0]).toHaveProperty('id', 'category-1');
      expect(ministry.categories[0]).toHaveProperty('name', 'Umwelt');
      
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
    
    test('sollte einen Fehler zurückgeben, wenn das Ministerium nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .get('/api/v1/ministries/nonexistent-id');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Ministerium nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Statistics API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/statistics', () => {
    test('sollte Statistiken zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '100' }]
      })).mockImplementationOnce(() => ({
        rows: [
          { status: 'submitted', count: '50' },
          { status: 'processing', count: '30' },
          { status: 'answered', count: '15' },
          { status: 'completed', count: '5' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          { category: 'Umwelt', count: '40' },
          { category: 'Bildung', count: '30' },
          { category: 'Verkehr', count: '20' },
          { category: 'Gesundheit', count: '10' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          { ministry: 'Umweltministerium', count: '40' },
          { ministry: 'Bildungsministerium', count: '30' },
          { ministry: 'Verkehrsministerium', count: '20' },
          { ministry: 'Gesundheitsministerium', count: '10' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          { date: new Date('2025-01-01'), count: '10' },
          { date: new Date('2025-01-02'), count: '15' },
          { date: new Date('2025-01-03'), count: '20' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [{ avg_days: 14.5 }]
      })).mockImplementationOnce(() => ({
        rows: [{ rate: 0.75 }]
      }));
      
      const response = await request(app)
        .get('/api/v1/statistics');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('statistics');
      
      const statistics = response.body.statistics;
      expect(statistics).toHaveProperty('total_proposals', 100);
      
      // Überprüfen der Vorschläge nach Status
      expect(statistics).toHaveProperty('proposals_by_status');
      expect(statistics.proposals_by_status).toHaveProperty('submitted', 50);
      expect(statistics.proposals_by_status).toHaveProperty('processing', 30);
      expect(statistics.proposals_by_status).toHaveProperty('answered', 15);
      expect(statistics.proposals_by_status).toHaveProperty('completed', 5);
      
      // Überprüfen der Vorschläge nach Kategorie
      expect(statistics).toHaveProperty('proposals_by_category');
      expect(statistics.proposals_by_category).toHaveLength(4);
      expect(statistics.proposals_by_category[0]).toHaveProperty('category', 'Umwelt');
      expect(statistics.proposals_by_category[0]).toHaveProperty('count', 40);
      
      // Überprüfen der Vorschläge nach Ministerium
      expect(statistics).toHaveProperty('proposals_by_ministry');
      expect(statistics.proposals_by_ministry).toHaveLength(4);
      expect(statistics.proposals_by_ministry[0]).toHaveProperty('ministry', 'Umweltministerium');
      expect(statistics.proposals_by_ministry[0]).toHaveProperty('count', 40);
      
      // Überprüfen der Vorschläge über Zeit
      expect(statistics).toHaveProperty('proposals_over_time');
      expect(statistics.proposals_over_time).toHaveLength(3);
      expect(statistics.proposals_over_time[0]).toHaveProperty('date');
      expect(statistics.proposals_over_time[0]).toHaveProperty('count', 10);
      
      // Überprüfen der durchschnittlichen Bearbeitungszeit
      expect(statistics).toHaveProperty('average_processing_time', 14.5);
      
      // Überprüfen der Umsetzungsrate
      expect(statistics).toHaveProperty('implementation_rate', 0.75);
      
      expect(pool.query).toHaveBeenCalledTimes(7);
    });
    
    test('sollte Zeitfilter korrekt anwenden', async () => {
      // Mock der Datenbankabfragen (vereinfacht)
      pool.query.mockImplementation(() => ({
        rows: [{ count: '0' }]
      }));
      
      const response = await request(app)
        .get('/api/v1/statistics')
        .query({ period: 'month' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Überprüfen, ob der Zeitfilter in der Query verwendet wurde
      expect(pool.query.mock.calls[0][0]).toContain('WHERE created_at >= NOW() - INTERVAL $1');
      expect(pool.query.mock.calls[0][1]).toEqual(['1 month']);
    });
  });
});

describe('Trends API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/trends', () => {
    test('sollte Trends zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [
          { tag: 'Nachhaltigkeit', count: '30' },
          { tag: 'Klimaschutz', count: '25' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '15' }]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '5' }]
      })).mockImplementationOnce(() => ({
        rows: [
          { id: 'proposal-1', title: 'Vorschlag zu Nachhaltigkeit 1' },
          { id: 'proposal-2', title: 'Vorschlag zu Nachhaltigkeit 2' },
          { id: 'proposal-3', title: 'Vorschlag zu Nachhaltigkeit 3' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '10' }]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '8' }]
      })).mockImplementationOnce(() => ({
        rows: [
          { id: 'proposal-4', title: 'Vorschlag zu Klimaschutz 1' },
          { id: 'proposal-5', title: 'Vorschlag zu Klimaschutz 2' }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/trends')
        .query({ limit: 2 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toHaveLength(2);
      
      // Überprüfen des ersten Trends
      expect(response.body.trends[0]).toHaveProperty('tag', 'Nachhaltigkeit');
      expect(response.body.trends[0]).toHaveProperty('count', 30);
      expect(response.body.trends[0]).toHaveProperty('growth_rate');
      expect(response.body.trends[0]).toHaveProperty('related_proposals');
      expect(response.body.trends[0].related_proposals).toHaveLength(3);
      expect(response.body.trends[0].related_proposals[0]).toHaveProperty('id', 'proposal-1');
      expect(response.body.trends[0].related_proposals[0]).toHaveProperty('title', 'Vorschlag zu Nachhaltigkeit 1');
      
      // Überprüfen des zweiten Trends
      expect(response.body.trends[1]).toHaveProperty('tag', 'Klimaschutz');
      expect(response.body.trends[1]).toHaveProperty('count', 25);
      expect(response.body.trends[1]).toHaveProperty('growth_rate');
      expect(response.body.trends[1]).toHaveProperty('related_proposals');
      expect(response.body.trends[1].related_proposals).toHaveLength(2);
      
      expect(pool.query).toHaveBeenCalledTimes(7);
    });
  });
});

describe('Recommendations API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/recommendations', () => {
    test('sollte Empfehlungen zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [
          { category: 'Umwelt' },
          { category: 'Bildung' }
        ]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-1',
            title: 'Umweltvorschlag',
            category: 'Umwelt',
            relevance_score: 1.0
          },
          {
            id: 'proposal-2',
            title: 'Bildungsvorschlag',
            category: 'Bildung',
            relevance_score: 1.0
          },
          {
            id: 'proposal-3',
            title: 'Verkehrsvorschlag',
            category: 'Verkehr',
            relevance_score: 0.3
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/recommendations')
        .set(mockAuthHeader('valid-token'))
        .query({ limit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body.recommendations).toHaveLength(3);
      
      // Überprüfen der Empfehlungen
      expect(response.body.recommendations[0]).toHaveProperty('id', 'proposal-1');
      expect(response.body.recommendations[0]).toHaveProperty('title', 'Umweltvorschlag');
      expect(response.body.recommendations[0]).toHaveProperty('category', 'Umwelt');
      expect(response.body.recommendations[0]).toHaveProperty('relevance_score', 1.0);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer nicht authentifiziert ist', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Authentifizierung erforderlich');
      
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
});

describe('Notifications API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/notifications', () => {
    test('sollte Benachrichtigungen zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '5' }]
      })).mockImplementationOnce(() => ({
        rows: [{ count: '2' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'notification-1',
            type: 'status_change',
            message: 'Der Status Ihres Vorschlags wurde geändert.',
            related_entity: {
              type: 'proposal',
              id: 'proposal-1'
            },
            read: false,
            created_at: new Date()
          },
          {
            id: 'notification-2',
            type: 'comment',
            message: 'Jemand hat Ihren Vorschlag kommentiert.',
            related_entity: {
              type: 'proposal',
              id: 'proposal-1'
            },
            read: true,
            created_at: new Date()
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/notifications')
        .set(mockAuthHeader('valid-token'))
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count', 5);
      expect(response.body).toHaveProperty('unread_count', 2);
      expect(response.body).toHaveProperty('notifications');
      expect(response.body.notifications).toHaveLength(2);
      
      // Überprüfen der Benachrichtigungen
      expect(response.body.notifications[0]).toHaveProperty('id', 'notification-1');
      expect(response.body.notifications[0]).toHaveProperty('type', 'status_change');
      expect(response.body.notifications[0]).toHaveProperty('message', 'Der Status Ihres Vorschlags wurde geändert.');
      expect(response.body.notifications[0]).toHaveProperty('related_entity');
      expect(response.body.notifications[0].related_entity).toHaveProperty('type', 'proposal');
      expect(response.body.notifications[0].related_entity).toHaveProperty('id', 'proposal-1');
      expect(response.body.notifications[0]).toHaveProperty('read', false);
      
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
    
    test('sollte Filter für gelesene/ungelesene Benachrichtigungen anwenden', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementation(() => ({
        rows: [{ count: '0' }]
      }));
      
      const response = await request(app)
        .get('/api/v1/notifications')
        .set(mockAuthHeader('valid-token'))
        .query({ read: 'false' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Überprüfen, ob der Filter in der Query verwendet wurde
      expect(pool.query.mock.calls[0][0]).toContain('AND read = $2');
      expect(pool.query.mock.calls[0][1]).toContain(false);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer nicht authentifiziert ist', async () => {
      const response = await request(app)
        .get('/api/v1/notifications');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error).toHaveProperty('message', 'Authentifizierung erforderlich');
      
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/v1/notifications/:id', () => {
    test('sollte eine Benachrichtigung als gelesen markieren', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{ id: 'notification-1' }]
      })).mockImplementationOnce(() => ({
        rows: [{
          id: 'notification-1',
          read: true
        }]
      }));
      
      const response = await request(app)
        .put('/api/v1/notifications/notification-1')
        .set(mockAuthHeader('valid-token'));
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('notification');
      expect(response.body.notification).toHaveProperty('id', 'notification-1');
      expect(response.body.notification).toHaveProperty('read', true);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
    
    test('sollte einen Fehler zurückgeben, wenn die Benachrichtigung nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .put('/api/v1/notifications/nonexistent-id')
        .set(mockAuthHeader('valid-token'));
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Benachrichtigung nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('PUT /api/v1/notifications', () => {
    test('sollte alle Benachrichtigungen als gelesen markieren', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rowCount: 5 }));
      
      const response = await request(app)
        .put('/api/v1/notifications')
        .set(mockAuthHeader('valid-token'));
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message', 'Alle Benachrichtigungen als gelesen markiert');
      expect(response.body).toHaveProperty('count', 5);
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Ministry Portal API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/ministry-portal/proposals', () => {
    test('sollte Vorschläge für das Ministeriumsportal zurückgeben (als Ministeriumsmitarbeiter)', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '10' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-1',
            title: 'Vorschlag 1',
            content: 'Inhalt des Vorschlags 1',
            category: 'Umwelt',
            status: 'submitted',
            priority: 'high',
            assigned_to: 'staff-1',
            created_at: new Date(),
            updated_at: new Date(),
            ai_analysis: {
              quality: 0.8,
              relevance: 0.9,
              feasibility: 0.7
            },
            user_id: 'user-1',
            user_name: 'User 1',
            user_email: 'user1@example.com',
            assignee_id: 'staff-1',
            assignee_name: 'Staff 1'
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/ministry-portal/proposals')
        .set(mockAuthHeader('ministry-token'))
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count', 10);
      expect(response.body).toHaveProperty('total_pages');
      expect(response.body).toHaveProperty('current_page', 1);
      expect(response.body).toHaveProperty('proposals');
      expect(response.body.proposals).toHaveLength(1);
      
      // Überprüfen des Vorschlags
      const proposal = response.body.proposals[0];
      expect(proposal).toHaveProperty('id', 'proposal-1');
      expect(proposal).toHaveProperty('title', 'Vorschlag 1');
      expect(proposal).toHaveProperty('content', 'Inhalt des Vorschlags 1');
      expect(proposal).toHaveProperty('category', 'Umwelt');
      expect(proposal).toHaveProperty('status', 'submitted');
      expect(proposal).toHaveProperty('priority', 'high');
      expect(proposal).toHaveProperty('assigned_to');
      expect(proposal.assigned_to).toHaveProperty('id', 'staff-1');
      expect(proposal.assigned_to).toHaveProperty('name', 'Staff 1');
      expect(proposal).toHaveProperty('user');
      expect(proposal.user).toHaveProperty('id', 'user-1');
      expect(proposal.user).toHaveProperty('name', 'User 1');
      expect(proposal.user).toHaveProperty('email', 'user1@example.com');
      expect(proposal).toHaveProperty('ai_analysis');
      expect(proposal.ai_analysis).toHaveProperty('quality', 0.8);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      
      // Überprüfen, ob der Ministeriumsfilter in der Query verwendet wurde
      expect(pool.query.mock.calls[0][0]).toContain('AND p.ministry = (SELECT ministry FROM ministry_staff WHERE user_id = $1)');
    });
    
    test('sollte Vorschläge für das Ministeriumsportal zurückgeben (als Administrator)', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{ count: '10' }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-1',
            title: 'Vorschlag 1',
            content: 'Inhalt des Vorschlags 1',
            category: 'Umwelt',
            status: 'submitted',
            priority: 'high',
            assigned_to: null,
            created_at: new Date(),
            updated_at: new Date(),
            ai_analysis: {
              quality: 0.8,
              relevance: 0.9,
              feasibility: 0.7
            },
            user_id: 'user-1',
            user_name: 'User 1',
            user_email: 'user1@example.com',
            assignee_id: null,
            assignee_name: null
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/ministry-portal/proposals')
        .set(mockAuthHeader('admin-token'))
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('proposals');
      expect(response.body.proposals).toHaveLength(1);
      
      // Überprüfen des Vorschlags
      const proposal = response.body.proposals[0];
      expect(proposal).toHaveProperty('assigned_to', null);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
      
      // Überprüfen, dass kein Ministeriumsfilter in der Query verwendet wurde
      expect(pool.query.mock.calls[0][0]).not.toContain('AND p.ministry = (SELECT ministry FROM ministry_staff WHERE user_id = $1)');
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer keine Berechtigung hat', async () => {
      const response = await request(app)
        .get('/api/v1/ministry-portal/proposals')
        .set(mockAuthHeader('valid-token')); // Normaler Bürger
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'FORBIDDEN');
      expect(response.body.error).toHaveProperty('message', 'Keine Berechtigung für diese Aktion');
      
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
  
  describe('PUT /api/v1/ministry-portal/proposals/:id', () => {
    test('sollte einen Vorschlag im Ministeriumsportal aktualisieren', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'proposal-1',
          status: 'submitted',
          ministry: 'Umweltministerium'
        }]
      })).mockImplementationOnce(() => ({
        rows: [{ ministry: 'Umweltministerium' }]
      })).mockImplementationOnce(() => ({
        client: {
          query: jest.fn()
            .mockResolvedValueOnce() // BEGIN
            .mockResolvedValueOnce({ // UPDATE proposals
              rows: [{
                id: 'proposal-1',
                status: 'processing',
                priority: 'high',
                assigned_to: 'staff-1',
                internal_notes: 'Interne Notizen',
                official_response: 'Offizielle Antwort',
                updated_at: new Date()
              }]
            })
            .mockResolvedValueOnce() // INSERT INTO status_history
            .mockResolvedValueOnce({ // SELECT title, user_id
              rows: [{
                title: 'Vorschlag 1',
                user_id: 'user-1'
              }]
            })
            .mockResolvedValueOnce() // INSERT INTO notifications
            .mockResolvedValueOnce({ // SELECT id, name
              rows: [{
                id: 'staff-1',
                name: 'Staff 1'
              }]
            })
            .mockResolvedValueOnce(), // COMMIT
          release: jest.fn()
        }
      }));
      
      const response = await request(app)
        .put('/api/v1/ministry-portal/proposals/proposal-1')
        .set(mockAuthHeader('ministry-token'))
        .send({
          status: 'processing',
          priority: 'high',
          assigned_to: 'staff-1',
          internal_notes: 'Interne Notizen',
          official_response: 'Offizielle Antwort'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('proposal');
      expect(response.body.proposal).toHaveProperty('id', 'proposal-1');
      expect(response.body.proposal).toHaveProperty('status', 'processing');
      expect(response.body.proposal).toHaveProperty('priority', 'high');
      expect(response.body.proposal).toHaveProperty('assigned_to');
      expect(response.body.proposal.assigned_to).toHaveProperty('id', 'staff-1');
      expect(response.body.proposal.assigned_to).toHaveProperty('name', 'Staff 1');
      expect(response.body.proposal).toHaveProperty('internal_notes', 'Interne Notizen');
      expect(response.body.proposal).toHaveProperty('official_response', 'Offizielle Antwort');
      
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Vorschlag nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .put('/api/v1/ministry-portal/proposals/nonexistent-id')
        .set(mockAuthHeader('ministry-token'))
        .send({
          status: 'processing'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Vorschlag nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer keine Berechtigung für das Ministerium hat', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'proposal-1',
          status: 'submitted',
          ministry: 'Umweltministerium'
        }]
      })).mockImplementationOnce(() => ({
        rows: [{ ministry: 'Bildungsministerium' }] // Anderes Ministerium
      }));
      
      const response = await request(app)
        .put('/api/v1/ministry-portal/proposals/proposal-1')
        .set(mockAuthHeader('ministry-token'))
        .send({
          status: 'processing'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'FORBIDDEN');
      expect(response.body.error).toHaveProperty('message', 'Keine Berechtigung für dieses Ministerium');
      
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
  });
});

describe('AI API', () => {
  const pool = require('pg').Pool();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/v1/ai/analyze', () => {
    test('sollte eine KI-Analyse durchführen', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze')
        .set(mockAuthHeader('ministry-token'))
        .send({
          text: 'Dies ist ein Vorschlag zur Verbesserung der Umweltsituation durch Verkehrsberuhigung.'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('analysis');
      
      const analysis = response.body.analysis;
      expect(analysis).toHaveProperty('categories');
      expect(analysis.categories).toHaveProperty('primary', 'Umwelt');
      expect(analysis.categories).toHaveProperty('secondary');
      expect(analysis.categories.secondary).toContain('Verkehr');
      expect(analysis).toHaveProperty('quality');
      expect(analysis.quality).toHaveProperty('overall_quality', 0.75);
      expect(analysis).toHaveProperty('ministries');
      expect(analysis.ministries).toHaveProperty('primary', 'Umweltministerium');
      expect(analysis).toHaveProperty('keywords');
      expect(analysis.keywords).toContain('Nachhaltigkeit');
      expect(analysis).toHaveProperty('summary');
    });
    
    test('sollte einen Fehler zurückgeben, wenn kein Text angegeben ist', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze')
        .set(mockAuthHeader('ministry-token'))
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error).toHaveProperty('message', 'Text ist erforderlich');
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Benutzer keine Berechtigung hat', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze')
        .set(mockAuthHeader('valid-token')) // Normaler Bürger
        .send({
          text: 'Dies ist ein Vorschlag.'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'FORBIDDEN');
      expect(response.body.error).toHaveProperty('message', 'Keine Berechtigung für diese Aktion');
    });
  });
  
  describe('GET /api/v1/ai/similar-proposals', () => {
    test('sollte ähnliche Vorschläge zurückgeben', async () => {
      // Mock der Datenbankabfragen
      pool.query.mockImplementationOnce(() => ({
        rows: [{
          id: 'proposal-1',
          content: 'Dies ist ein Vorschlag zur Verbesserung der Umweltsituation.',
          category: 'Umwelt'
        }]
      })).mockImplementationOnce(() => ({
        rows: [
          {
            id: 'proposal-2',
            title: 'Ähnlicher Vorschlag 1',
            status: 'submitted',
            similarity_score: 0.8
          },
          {
            id: 'proposal-3',
            title: 'Ähnlicher Vorschlag 2',
            status: 'processing',
            similarity_score: 0.7
          }
        ]
      }));
      
      const response = await request(app)
        .get('/api/v1/ai/similar-proposals')
        .query({
          proposal_id: 'proposal-1',
          limit: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('similar_proposals');
      expect(response.body.similar_proposals).toHaveLength(2);
      
      // Überprüfen der ähnlichen Vorschläge
      expect(response.body.similar_proposals[0]).toHaveProperty('id', 'proposal-2');
      expect(response.body.similar_proposals[0]).toHaveProperty('title', 'Ähnlicher Vorschlag 1');
      expect(response.body.similar_proposals[0]).toHaveProperty('status', 'submitted');
      expect(response.body.similar_proposals[0]).toHaveProperty('similarity_score', 0.8);
      
      expect(pool.query).toHaveBeenCalledTimes(2);
    });
    
    test('sollte einen Fehler zurückgeben, wenn keine Vorschlags-ID angegeben ist', async () => {
      const response = await request(app)
        .get('/api/v1/ai/similar-proposals');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error).toHaveProperty('message', 'Vorschlags-ID ist erforderlich');
    });
    
    test('sollte einen Fehler zurückgeben, wenn der Vorschlag nicht gefunden wird', async () => {
      // Mock der Datenbankabfrage
      pool.query.mockImplementationOnce(() => ({ rows: [] }));
      
      const response = await request(app)
        .get('/api/v1/ai/similar-proposals')
        .query({
          proposal_id: 'nonexistent-id'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message', 'Vorschlag nicht gefunden');
      
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Status API', () => {
  describe('GET /api/v1/status', () => {
    test('sollte den API-Status zurückgeben', async () => {
      const response = await request(app)
        .get('/api/v1/status');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
